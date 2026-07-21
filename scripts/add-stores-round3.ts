import { db, storeOffers } from "../src/db";

const NEW_OFFERS: { productId: number; storeId: number; productUrl: string }[] = [
  { productId: 19, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/fino-premium-touch-hair-mask-230g/pdp/103076403" },
  { productId: 19, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/shiseido-fino-premium-touch-hair-mask/" },
  { productId: 23, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D9%84%D8%B5%D9%82%D8%A7%D8%AA-%D8%AA%D9%86%D8%B8%D9%8A%D9%81-%D8%A7%D9%84%D8%A3%D9%86%D9%81-%D9%85%D9%86-%D9%83%D9%8A%D9%84%D8%A7%D9%86-4-%D8%AD%D8%A8%D8%A7%D8%AA/p1757179926" },
  { productId: 24, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/oznaturals-vitamin-c-serum-30-ml/pdp/101766654" },
  { productId: 24, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/serum-vitamin-c-skin-care-from-oz-naturals---30-ml/p197758718" },
  { productId: 25, storeId: 4, productUrl: "https://daralamirat.com.sa/en/ordinary-serum---hyaluronic-acid-serum-to-moisturize-the-skin/p1147914948" },
  { productId: 25, storeId: 3, productUrl: "https://niceonesa.com/en/the-ordinary-hyaluronic-acid-2-b5-30ml-n11700" },
  { productId: 34, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D9%82%D9%86%D8%A7%D8%B9-%D8%A7%D9%84%D9%86%D9%88%D9%85-%D8%A8%D8%A7%D9%84%D9%83%D9%88%D9%84%D8%A7%D8%AC%D9%8A%D9%86-%D9%84%D8%AA%D8%B1%D8%B7%D9%8A%D8%A8-%D8%A7%D9%84%D8%A8%D8%B4%D8%B1%D8%A9-%D9%85%D9%86-%D8%A7%D9%8A%D9%84%D9%8A%D8%B4%D8%A7%D9%83%D9%88%D9%8A-50-%D9%85%D9%84/p1457217076" },
  { productId: 36, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/garnier-skin-active-face-booster-serum-anti-dark-spot-30-ml.html" },
  { productId: 36, storeId: 3, productUrl: "https://niceonesa.com/en/garnier-skinactive-fast-bright-30-x-vitamin-c-face-serum-30ml-n22309" },
  { productId: 38, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D9%86%D8%A7%D8%AA%D8%B4%D8%B1-%D8%B1%D9%8A%D8%A8%D9%88%D8%B1%D8%AA-%D8%AC%D9%84-%D8%A7%D9%84%D8%B5%D8%A8%D8%A7%D8%B1-99-%D9%85%D9%87%D8%AF%D8%A6-%D9%88%D9%85%D8%B1%D8%B7%D8%A8-%D8%8C-300-%D9%85%D9%84/p1666908752" },
  { productId: 46, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/jayjun-green-tea-eye-gel-patch-1-4g-x-60pcs/" },
  { productId: 48, storeId: 1, productUrl: "https://www.nahdionline.com/ar/mavala-scientifique-k-nail-h" },
  { productId: 48, storeId: 4, productUrl: "https://daralamirat.com.sa/en/mavala---nails,-5-ml/p735375520" },
  { productId: 48, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/mavala-scientifique-k-nail-hardener-5ml/" },
  { productId: 49, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/eveline-white-prestige-4d-whitening-hand-cream-100-ml/pdp/102787596" },
  { productId: 51, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/paper-mints---leaf-mint-cold-capsule---18-capsules/p901030608" },
  { productId: 53, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/q-v-cream-500gm.html" },
  { productId: 53, storeId: 4, productUrl: "https://daralamirat.com.sa/en/copy-skin-moisturizing-cream-500-grams/p1603121953" },
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
