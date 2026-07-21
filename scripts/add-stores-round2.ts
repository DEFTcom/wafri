import { db, storeOffers } from "../src/db";

(async () => {
  await db.insert(storeOffers).values({
    productId: 106, // جيوفاني شامبو شجرة الشاي 250ml
    storeId: 1,
    productUrl: "https://www.nahdionline.com/en-sa/giovanni-teatree-triple-treat-shamoo-250ml/pdp/102959052",
  });
  console.log("✓ أُضيف جيوفاني بالنهدي");
  process.exit(0);
})();
