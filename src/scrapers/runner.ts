import { eq, and, isNull, sql } from "drizzle-orm";
import {
  db,
  priceHistory,
  products,
  scrapeRuns,
  storeOffers,
  stores,
} from "../db";
import { getScraper } from "./stores";
import type { ScraperConfig } from "./types";

// ينفّذ عناصر بحد أقصى من التوازي بدل انتظار كل عنصر لحاله. لو تجاوزنا
// deadline (مهلة زمنية مطلقة) نتوقف عن بدء عناصر جديدة بدل ما ننتظر لحد ما
// تقتلنا Vercel — هذا يضمن إغلاق scrape_runs بحالة نظيفة دايماً، مو مقطوعة
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  deadline: number | undefined,
  fn: (item: T) => Promise<R>
): Promise<{ results: R[]; attempted: number }> {
  const results: R[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      if (deadline && Date.now() >= deadline) return;
      const i = cursor++;
      results.push(await fn(items[i]));
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return { results, attempted: cursor };
}

// يسحب كل عروض متجر واحد: يسجل price_history لكل قراءة (حتى لو ما تغير السعر)،
// فشل منتج لا يوقف الباقي، وكل التشغيلة تُسجل صفاً في scrape_runs.
// deadline (اختياري): وقت مطلق (Date.now() + ms) نتوقف بعده عن بدء عروض
// جديدة — يُستخدم من مسار الـ cron عشان نضمن رد قبل ما تقتل Vercel الدالة.
export async function runStoreScrape(storeId: number, deadline?: number): Promise<void> {
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId));
  if (!store || !store.isActive) return;

  const config = (store.scraperConfig ?? {}) as ScraperConfig;
  const scraper = getScraper(store.baseDomain);

  // الأقدم سحباً أولاً (والفارغة أولاً) — عشان لو التشغيلة انقطعت بالمهلة،
  // العروض اللي ما وصلها الدور تاخذ الأولوية بالتشغيلة الجاية بدل ما تُهمَل دايماً
  const offers = await db
    .select()
    .from(storeOffers)
    .where(
      and(eq(storeOffers.storeId, storeId), eq(storeOffers.linkMode, "auto"))
    )
    .orderBy(sql`${storeOffers.lastScrapedAt} asc nulls first`);

  const [run] = await db
    .insert(scrapeRuns)
    .values({ storeId, productsAttempted: offers.length })
    .returning();

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  const { attempted } = await mapLimit(offers, config.concurrency ?? 15, deadline, async (offer) => {
    try {
      const result = await scraper.scrapeProduct(offer.productUrl, config);
      await db.insert(priceHistory).values({
        storeOfferId: offer.id,
        price: result.price!,
        isAvailable: result.available,
      });
      await db
        .update(storeOffers)
        .set({
          currentPrice: result.price,
          isAvailable: result.available,
          rawTitle: offer.rawTitle || result.title,
          lastScrapedAt: new Date(),
          lastScrapeStatus: "ok",
          lastScrapeError: null,
        })
        .where(eq(storeOffers.id, offer.id));
      if (result.imageUrl) {
        // تعبئة صورة المنتج الموحّد إن كانت فاضية
        await db
          .update(products)
          .set({ imageUrl: result.imageUrl })
          .where(
            and(eq(products.id, offer.productId), isNull(products.imageUrl))
          );
      }
      success++;
    } catch (e) {
      failed++;
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`عرض ${offer.id}: ${message}`);
      await db
        .update(storeOffers)
        .set({ lastScrapedAt: new Date(), lastScrapeStatus: "failed", lastScrapeError: message })
        .where(eq(storeOffers.id, offer.id));
    }
  });

  const timedOut = attempted < offers.length;
  await db
    .update(scrapeRuns)
    .set({
      finishedAt: new Date(),
      productsAttempted: attempted,
      productsSuccess: success,
      productsFailed: failed,
      status: failed === 0 && !timedOut ? "success" : success > 0 ? "partial" : "failed",
      errorLog: [
        ...errors,
        ...(timedOut ? [`توقف السحب بسبب المهلة الزمنية — ${offers.length - attempted} عرض لم يُحاول بعد (سيُعطى الأولوية بالتشغيلة الجاية)`] : []),
      ].join("\n") || null,
    })
    .where(eq(scrapeRuns.id, run.id));
}

// يسحب عرض واحد فوراً (زر «سحب الآن» بلوحة الإدارة) — بدون انتظار الجدولة اليومية
export async function scrapeOffer(offerId: number): Promise<{ ok: boolean; error?: string }> {
  const [offer] = await db.select().from(storeOffers).where(eq(storeOffers.id, offerId));
  if (!offer) return { ok: false, error: "العرض غير موجود" };
  if (offer.linkMode !== "auto") return { ok: false, error: "السعر يدوي — لا يُسحب تلقائياً" };

  const [store] = await db.select().from(stores).where(eq(stores.id, offer.storeId));
  if (!store) return { ok: false, error: "المتجر غير موجود" };

  const config = (store.scraperConfig ?? {}) as ScraperConfig;
  const scraper = getScraper(store.baseDomain);

  try {
    const result = await scraper.scrapeProduct(offer.productUrl, config);
    await db.insert(priceHistory).values({
      storeOfferId: offer.id,
      price: result.price!,
      isAvailable: result.available,
    });
    await db
      .update(storeOffers)
      .set({
        currentPrice: result.price,
        isAvailable: result.available,
        rawTitle: offer.rawTitle || result.title,
        lastScrapedAt: new Date(),
        lastScrapeStatus: "ok",
        lastScrapeError: null,
      })
      .where(eq(storeOffers.id, offer.id));
    if (result.imageUrl) {
      await db
        .update(products)
        .set({ imageUrl: result.imageUrl })
        .where(and(eq(products.id, offer.productId), isNull(products.imageUrl)));
    }
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await db
      .update(storeOffers)
      .set({ lastScrapedAt: new Date(), lastScrapeStatus: "failed", lastScrapeError: error })
      .where(eq(storeOffers.id, offer.id));
    return { ok: false, error };
  }
}

// deadline (اختياري): وقت مطلق تتوقف بعده كل المتاجر عن بدء عروض جديدة —
// مررها /api/cron/scrape بهامش أمان تحت مهلة Vercel (٦٠ ثانية Hobby)
export async function runAllStores(deadline?: number): Promise<void> {
  const active = await db.select().from(stores).where(eq(stores.isActive, true));
  // المتاجر تُسحب بالتوازي فيما بينها أيضاً — مو بس داخل كل متجر — لأن السحب
  // التسلسلي لخمسة متاجر كان يتجاوز مهلة دوال Vercel بسهولة
  await Promise.all(
    active.map(async (store) => {
      console.log(`سحب متجر: ${store.nameAr}`);
      await runStoreScrape(store.id, deadline);
    })
  );
}
