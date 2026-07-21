import { db, products, storeOffers } from "../src/db";
import { ilike, eq } from "drizzle-orm";
(async () => {
  const [p] = await db.select().from(products).where(ilike(products.nameAr, '%اختبار سحب تلقائي%'));
  console.log("product:", JSON.stringify(p));
  if (p) {
    const offers = await db.select().from(storeOffers).where(eq(storeOffers.productId, p.id));
    console.log("offers:", JSON.stringify(offers, null, 2));
  }
  process.exit(0);
})();
