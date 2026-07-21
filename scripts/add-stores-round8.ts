import { db, storeOffers } from "../src/db";

const NEW_OFFERS: { productId: number; storeId: number; productUrl: string }[] = [
  { productId: 18, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/TRESemm%C3%A9-Heat-Protectant-Spray-up-to450/p1478396687" },
  { productId: 44, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/the-ordinary-caffeine-solution-30-ml.html" },
  { productId: 44, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D9%85%D8%AD%D9%84%D9%88%D9%84-%D9%83%D8%A7%D9%81%D9%8A%D9%8A%D9%86-5-egcg-%D9%85%D9%86-%D8%B0%D8%A7-%D8%A7%D9%88%D8%B1%D8%AF%D9%8A%D9%86%D8%A7%D8%B1%D9%8A-30-%D9%85%D9%84/p180919918" },
  { productId: 44, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/the-ordinary-caffeine-solution-5-egcg-30ml/" },
  { productId: 45, storeId: 5, productUrl: "https://www.whites.sa/en-sa/body-blendz-lash-brow-growth-serum-10-ml/" },
];

(async () => {
  let added = 0;
  for (const o of NEW_OFFERS) {
    try {
      await db.insert(storeOffers).values(o);
      added++;
      console.log(`✓ منتج ${o.productId} → متجر ${o.storeId}`);
    } catch (e) {
      console.log(`✗ فشل منتج ${o.productId} → متجر ${o.storeId}: ${e instanceof Error ? e.message.slice(0, 80) : e}`);
    }
  }
  console.log(`\nإجمالي: ${added} عرض جديد أُضيف.`);
  process.exit(0);
})();
