import { db, storeOffers } from "../src/db";

const NEW_OFFERS: { productId: number; storeId: number; productUrl: string }[] = [
  { productId: 76, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/hand-and-nail-intensive-care-cream-from-vaseline---75-ml/p1436703146" },
  { productId: 79, storeId: 1, productUrl: "https://www.nahdionline.com/en-sa/ego-qv-hand-cream-with-spf-15-50-gm/pdp/101594784" },
  { productId: 79, storeId: 2, productUrl: "https://unitedpharmacy.sa/en/q-v-hand-cream-spf-15-50gm.html" },
  { productId: 80, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D8%AF%D9%8A%D8%B1%D9%85%D8%A7-%D8%B1%D9%88%D9%84%D8%B1-%D8%B3%D9%8A%D8%B3%D8%AA%D9%85-%D9%84%D9%84%D8%A8%D8%B4%D8%B1%D8%A9-540-%D8%A7%D8%A8%D8%B1%D8%A9-%D9%85%D8%B5%D9%86%D9%88%D8%B9%D8%A9-%D9%85%D9%86-%D8%A7%D9%84%D8%AA%D9%8A%D8%AA%D8%A7%D9%86%D9%8A%D9%88%D9%85-050-%D9%85%D9%84%D9%84%D9%8A%D9%85%D8%AA%D8%B1/p369145968" },
  { productId: 80, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/derma-roller-microoneedle-system-for-hair-0-50mm/" },
  { productId: 83, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/vaseline-thai-gluta-glow-ultra-bright-deodorant-45ml/p318976337" },
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
