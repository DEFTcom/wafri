import { db, storeOffers } from "../src/db";

const NEW_OFFERS: { productId: number; storeId: number; productUrl: string }[] = [
  { productId: 56, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/noo-sweet-almond-oil-for-moisturizing---118-ml/p680294247" },
  { productId: 92, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/nao-glyperin-vegetable-oil---118-ml/p2053805664" },
  { productId: 99, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/now-rosemary-essential-oil-30ml/p57900001" },
  { productId: 99, storeId: 3, productUrl: "https://niceonesa.com/en/now-essential-oils-rosemary-30ml-n6742" },
  { productId: 58, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/krem-kap-cream-scrubbing-exfoliating-500-gm/pdp/100603298" },
  { productId: 58, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/krem-kap-body-face-scrub-exfoliating-500-ml.html" },
  { productId: 58, storeId: 4, productUrl: "https://daralamirat.com.sa/en/krem-kap-peeling-and-whitening-face-and-body-500-egp/p2133610104" },
  { productId: 59, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/stives-collagen-elastin-340-283-gm/pdp/100554991" },
  { productId: 59, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/estevz-face-moisturizing-cream-with-collagen-and-protein-283-grams/p1466524754" },
  { productId: 59, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/st-ives-facial-moisturizer-timeless-skin-collagen-elastin-283g/" },
  { productId: 60, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/vaseline-intensive-care-cocoa-radiant-body-oil-200-ml.html" },
  { productId: 60, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/vaseline-intensive-care-cocoa-radiant-body-gel-oil-200ml/p1479312465" },
  { productId: 60, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/vaseline-body-oil-gel-coca-butter-200-ml/" },
  { productId: 65, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D9%83%D8%B1%D9%8A%D9%85-%D8%A7%D9%84%D8%AC%D8%B3%D9%85-%D8%B2%D8%A8%D8%AF%D8%A9-%D8%A7%D9%84%D9%83%D8%A7%D9%83%D8%A7%D9%88-%D9%85%D9%86-%D9%83%D9%84%D9%8A%D8%B1-500-%D9%85%D9%84/p1727666595" },
  { productId: 67, storeId: 4, productUrl: "https://daralamirat.com.sa/nubian-heritage-african-black-soap-body-wash-384-ml.html" },
  { productId: 67, storeId: 5, productUrl: "https://www.whites.sa/en-sa/nubian-heritage-body-wash-with-african-black-soap-384-ml/" },
  { productId: 68, storeId: 4, productUrl: "https://daralamirat.com.sa/en/ultra-max-odorless-deodorant-from-arm-hammer/p362345978" },
  { productId: 100, storeId: 1, productUrl: "https://www.nahdionline.com/en/labello-lip-balm-blackberry-shine-4-8-gm" },
  { productId: 103, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/parachute-coconut-oil-edible-175-ml/pdp/103309861" },
  { productId: 103, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/parachute-pure-coconut-hair-oil-175-ml.html" },
  { productId: 103, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D8%B2%D9%8A%D8%AA-%D8%AC%D9%88%D8%B2-%D9%87%D9%86%D8%AF-%D9%86%D9%82%D9%8A-100-%D9%85%D9%86-%D8%A8%D8%A7%D8%B1%D8%A7%D8%B4%D9%88%D8%AA-175%D9%85%D9%84/p589049092" },
  { productId: 104, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D8%A7%D8%AC%D9%85%D9%84-%D8%A8%D9%88%D8%AF%D8%B1%D8%A9-%D8%AC%D8%B3%D9%85-%D8%A7%D9%88%D8%B1%D9%88%D9%85-%D8%B3%D9%85%D8%B1-100-%D9%85%D9%84/p452569553" },
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
