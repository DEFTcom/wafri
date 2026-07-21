import { eq, sql } from "drizzle-orm";
import { db, products, storeOffers, stores } from "../src/db";

(async () => {
  const rows = await db
    .select({
      id: products.id,
      name: products.nameAr,
      brand: products.brand,
      size: products.sizeVariant,
      cnt: sql<number>`count(*)::int`,
    })
    .from(products)
    .innerJoin(storeOffers, eq(storeOffers.productId, products.id))
    .groupBy(products.id)
    .having(sql`count(*) = 1`)
    .orderBy(products.id);

  console.log("عدد المنتجات بمتجر واحد:", rows.length);
  for (const r of rows) {
    const [offer] = await db
      .select({ storeName: stores.nameAr, url: storeOffers.productUrl })
      .from(storeOffers)
      .innerJoin(stores, eq(stores.id, storeOffers.storeId))
      .where(eq(storeOffers.productId, r.id));
    console.log(`${r.id} | ${r.name} | ${r.brand} | ${r.size} | حالياً: ${offer.storeName}`);
  }
  process.exit(0);
})();
