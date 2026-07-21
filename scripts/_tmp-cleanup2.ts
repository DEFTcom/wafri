import { db, products, storeOffers } from "../src/db";
import { eq } from "drizzle-orm";
(async () => {
  await db.delete(storeOffers).where(eq(storeOffers.productId, 109));
  await db.delete(products).where(eq(products.id, 109));
  console.log("cleaned up test product 109");
  process.exit(0);
})();
