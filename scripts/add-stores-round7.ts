import { db, storeOffers } from "../src/db";

const NEW_OFFERS: { productId: number; storeId: number; productUrl: string }[] = [
  { productId: 69, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/cetaphil-moisturizing-cream-face-body-100-gm.html" },
  { productId: 69, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/face-body-moisturizing-cream-100g/" },
  { productId: 69, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D9%83%D8%B1%D9%8A%D9%85-%D9%85%D8%B1%D8%B7%D8%A8-%D8%AE%D8%A7%D9%84%D9%8A-%D9%85%D9%86-%D8%A7%D9%84%D8%B9%D8%B7%D9%88%D8%B1-%D9%84%D9%84%D8%A8%D8%B4%D8%B1%D8%A9-%D8%A7%D9%84%D8%AD%D8%B3%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AC%D8%A7%D9%81%D8%A9-%D9%85%D9%86-%D8%B3%D9%8A%D8%AA%D8%A7%D9%81%D9%8A%D9%84-100-%D8%AC%D8%B1%D8%A7%D9%85/p1329636105" },
  { productId: 69, storeId: 3, productUrl: "https://niceonesa.com/en/cetaphil-moisturizing-cream-100g-n6234" },
  { productId: 73, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/bio-oil-for-scars-and-stretch-marks-60-ml.html" },
  { productId: 73, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/brands/bio_oil" },
  { productId: 73, storeId: 3, productUrl: "https://niceonesa.com/ar/bio-oil-natural-skincare-oil-60ml-n18090" },
  { productId: 74, storeId: 3, productUrl: "https://niceonesa.com/en/la-roche-posay-anthelios-uvmune-400-invisible-fluid-spf50-50ml-n19734" },
  { productId: 74, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/la-roche-posay-anthelios-uvmune-invisible-spf50-400-sunscreen-50-ml/p914951485" },
  { productId: 74, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/la-roche-posay-anthelios-uvmune-400-invisible-fluid-spf50-50ml/" },
  { productId: 91, storeId: 3, productUrl: "https://niceonesa.com/en/summers-eve-lavnder-night-time-cleansing-wash-for-sensitive-skin-354ml-n7877" },
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
