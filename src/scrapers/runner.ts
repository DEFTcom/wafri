import { eq, and, isNull } from "drizzle-orm";
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// يسحب كل عروض متجر واحد: يسجل price_history لكل قراءة (حتى لو ما تغير السعر)،
// فشل منتج لا يوقف الباقي، وكل التشغيلة تُسجل صفاً في scrape_runs.
export async function runStoreScrape(storeId: number): Promise<void> {
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId));
  if (!store || !store.isActive) return;

  const config = (store.scraperConfig ?? {}) as ScraperConfig;
  const scraper = getScraper(store.baseDomain);

  const offers = await db
    .select()
    .from(storeOffers)
    .where(
      and(eq(storeOffers.storeId, storeId), eq(storeOffers.linkMode, "auto"))
    );

  const [run] = await db
    .insert(scrapeRuns)
    .values({ storeId, productsAttempted: offers.length })
    .returning();

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const offer of offers) {
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
      errors.push(`عرض ${offer.id}: ${e instanceof Error ? e.message : e}`);
      await db
        .update(storeOffers)
        .set({ lastScrapedAt: new Date(), lastScrapeStatus: "failed" })
        .where(eq(storeOffers.id, offer.id));
    }
    await sleep(config.requestDelayMs ?? 2500);
  }

  await db
    .update(scrapeRuns)
    .set({
      finishedAt: new Date(),
      productsSuccess: success,
      productsFailed: failed,
      status: failed === 0 ? "success" : success > 0 ? "partial" : "failed",
      errorLog: errors.length ? errors.join("\n") : null,
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
      .set({ lastScrapedAt: new Date(), lastScrapeStatus: "failed" })
      .where(eq(storeOffers.id, offer.id));
    return { ok: false, error };
  }
}

export async function runAllStores(): Promise<void> {
  const active = await db.select().from(stores).where(eq(stores.isActive, true));
  for (const store of active) {
    console.log(`سحب متجر: ${store.nameAr}`);
    await runStoreScrape(store.id);
  }
}
