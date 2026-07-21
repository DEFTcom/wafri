import { db, storeOffers } from "../src/db";

const NEW_OFFERS: { productId: number; storeId: number; productUrl: string }[] = [
  { productId: 22, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D9%85%D8%AC%D9%85%D9%88%D8%B9%D8%A9-%D8%B1%D9%88%D8%AA%D9%8A%D9%86-%D8%A7%D9%84%D8%B9%D9%86%D8%A7%D9%8A%D8%A9-aha-bha-pha-%D9%8A%D9%88%D9%85%D8%A7-%D9%85%D9%86-%D8%B3%D9%88%D9%85-%D8%A8%D8%A7%D9%8A-%D9%85%D9%8A-4-%D9%82%D8%B7%D8%B9/p793939774" },
  { productId: 22, storeId: 5, productUrl: "https://www.whites.sa/en-sa/some-by-mi-aha-bha-pha-30-days-miracle-starter-set/" },
  { productId: 31, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/aha-bha-pha-pha/p1395806510" },
  { productId: 31, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/some-by-mi-aha-bha-pha-30-days-miracle-toner-150-ml/" },
  { productId: 31, storeId: 1, productUrl: "https://nahdionline.com/ar-sa/101914670/pdp/101914670" },
  { productId: 32, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/somebymi-30-days-miracle-clear-spot-patch-18-pcs/pdp/101914725" },
  { productId: 32, storeId: 4, productUrl: "https://daralamirat.com.sa/en/som-bay-me---acne-treatment-adhesive-30-magic-compact-18-adhesive/p2101107874" },
  { productId: 32, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/some-by-mi-30-days-miracle-clear-spot-patch-18-pcs/" },
  { productId: 39, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/some-by-mi-bye-bye-blackhead-bubble-cleanser-120-g/" },
  { productId: 39, storeId: 1, productUrl: "https://www.nahdionline.com/ar/some-by-mi-30-days-miracle-bubble-cleanser-120-ml" },
  { productId: 39, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/black-headphone-cleaner-from-som-bay-me---120g/p1710880904" },
  { productId: 105, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/somebymi-30-days-miracle-cream-60-gm/pdp/101914696" },
  { productId: 105, storeId: 4, productUrl: "https://daralamirat.com.sa/en/som-bay-me---korean-miracle-cream-60-grams/p558225640" },
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
