import { db, storeOffers } from "../src/db";

const NEW_OFFERS: { productId: number; storeId: number; productUrl: string }[] = [
  { productId: 52, storeId: 1, productUrl: "https://www.nahdionline.com/en-sa/pyray-ayurvedic-soap-75-gm/pdp/100612733" },
  { productId: 52, storeId: 4, productUrl: "https://daralamirat.com.sa/en/turmeric-soap-from-payry/p1325880548" },
  { productId: 52, storeId: 5, productUrl: "https://www.whites.sa/en-sa/kurkum-soap-pyary-turmeric-7/" },
  { productId: 52, storeId: 2, productUrl: "https://unitedpharmacy.sa/en/pyary-soap-turmeric-75gm.html" },
  { productId: 54, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/q-v-cream-100gm.html" },
  { productId: 54, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/qv-moisturizing-cream-dry-sensitive-skin-100g/p1227354896" },
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
