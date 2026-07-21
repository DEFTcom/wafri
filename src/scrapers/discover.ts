import { eq } from "drizzle-orm";
import { db, discoveryQueue, storeOffers, stores } from "../db";
import { getScraper } from "./stores";
import type { ScraperConfig } from "./types";

// الزحف الهجين — يكتشف منتجات جديدة من صفحات الأشهر/الأكثر مبيعاً ويضعها
// في discovery_queue للمراجعة. لا يُنشئ منتجات منشورة مباشرة أبداً.
export async function runDiscovery(): Promise<number> {
  const active = await db.select().from(stores).where(eq(stores.isActive, true));
  let added = 0;

  for (const store of active) {
    const config = (store.scraperConfig ?? {}) as ScraperConfig;
    if (!config.discoveryUrls?.length) continue;

    console.log(`اكتشاف منتجات: ${store.nameAr}`);
    const found = await getScraper(store.baseDomain).discoverProducts(config);

    const known = new Set(
      (
        await db
          .select({ url: storeOffers.productUrl })
          .from(storeOffers)
          .where(eq(storeOffers.storeId, store.id))
      ).map((r) => r.url)
    );

    for (const item of found) {
      if (known.has(item.productUrl)) continue;
      const inserted = await db
        .insert(discoveryQueue)
        .values({
          storeId: store.id,
          rawTitle: item.rawTitle,
          productUrl: item.productUrl,
          price: item.price,
          imageUrl: item.imageUrl,
          discoverySource: "bestseller",
        })
        .onConflictDoNothing()
        .returning({ id: discoveryQueue.id });
      added += inserted.length;
    }
  }
  return added;
}
