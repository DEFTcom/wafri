import { eq, gte } from "drizzle-orm";
import { db, products, storeOffers, stores } from "../src/db";

(async () => {
  const rows = await db
    .select({
      pid: storeOffers.productId,
      pname: products.nameAr,
      size: products.sizeVariant,
      store: stores.nameAr,
      price: storeOffers.currentPrice,
      status: storeOffers.lastScrapeStatus,
      rawTitle: storeOffers.rawTitle,
    })
    .from(storeOffers)
    .innerJoin(stores, eq(stores.id, storeOffers.storeId))
    .innerJoin(products, eq(products.id, storeOffers.productId))
    .where(gte(storeOffers.productId, 15))
    .orderBy(storeOffers.productId);

  let last = 0;
  let ok = 0;
  let failed = 0;
  const failures: string[] = [];
  for (const r of rows) {
    if (r.pid !== last) {
      console.log(`\n■ ${r.pid}: ${r.pname} (${r.size})`);
      last = r.pid;
    }
    if (r.status === "ok") {
      ok++;
      console.log(`  ✓ ${r.store} | ${r.price} | ${r.rawTitle.slice(0, 60)}`);
    } else {
      failed++;
      console.log(`  ✗ ${r.store} | فشل السحب`);
      failures.push(`${r.pid} ${r.pname} — ${r.store}`);
    }
  }
  console.log(`\n\nإجمالي: ${ok} عرض ناجح، ${failed} عرض فاشل`);
  if (failures.length) {
    console.log("\nالفاشلة:");
    failures.forEach((f) => console.log(" - " + f));
  }
  process.exit(0);
})();
