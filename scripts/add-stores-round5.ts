import { db, storeOffers } from "../src/db";

const NEW_OFFERS: { productId: number; storeId: number; productUrl: string }[] = [
  { productId: 29, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/cosrx-advanced-snail-92-all-in-one-cream/pdp/102709774" },
  { productId: 29, storeId: 4, productUrl: "https://daralamirat.com.sa/en/cosrx-advanced-snail-92-cream/p1548656880" },
  { productId: 30, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/cosrx-advanced-snail-96-mucin-power-essence/pdp/102709766" },
  { productId: 30, storeId: 4, productUrl: "https://daralamirat.com.sa/en/cosrx-advanced-snail-96-mucin-power-essence---100ml/p1950746949" },
  { productId: 42, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/laneige-lip-sleeping-mask-berry-ex-20-gm/pdp/102916327" },
  { productId: 42, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/%D9%82%D9%86%D8%A7%D8%B9-%D8%A7%D9%84%D8%B4%D9%81%D8%A7%D9%87-%D8%A7%D9%84%D9%85%D8%B1%D8%B7%D8%A8-%D8%A7%D9%84%D9%84%D9%8A%D9%84%D9%8A-%D8%A8%D9%8A%D8%B1%D9%8A-%D9%85%D9%86-%D9%84%D8%A7%D9%86%D9%8A%D8%AC-20-%D8%AC%D8%B1%D8%A7%D9%85/p418097297" },
  { productId: 82, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/some-by-mi-retinol-eye-cream-30-ml/pdp/102846761" },
  { productId: 96, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/axis-y-dark-spot-correcting-glow-serum-50ml/pdp/103174724" },
  { productId: 96, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/axis-y-dark-spot-correcting-glow-serum-50-ml/" },
  { productId: 96, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/axis-y-dark-spot-correcting-serum-50ml/p594585396" },
  { productId: 102, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/beauty-of-joseon-glow-serum-proplis-niacinamide/pdp/102852298" },
  { productId: 102, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/beauty-of-josun-glowing-serum-honey-niacinamide-30ml/p674863823" },
  { productId: 28, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/bioderma-sebium-gel-moussant-foaming-cleanser-for-oily-skin-500-ml/pdp/100734271" },
  { productId: 28, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/bioderma-sebium-moussant-cleansing-gel-500ml.html" },
  { productId: 28, storeId: 5, productUrl: "https://www.whites.sa/ar-sa/bioderma-sebium-gel-moussant-purifying-cleansing-foaming-gel-500-ml/" },
  { productId: 72, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/anua-heartleaf-pore-control-cleansing-oil-200ml/p2010052502" },
  { productId: 72, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/anua-hearleaf-pore-control-cleansing-oil-200ml/pdp/102967204" },
  { productId: 72, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/anua-heart-leave-pore-ctrl-clean-200ml.html" },
  { productId: 85, storeId: 1, productUrl: "https://www.nahdionline.com/ar-sa/anua-heartleaf-77-soothing-toner-250ml-250ml/pdp/102967167" },
  { productId: 85, storeId: 4, productUrl: "https://daralamirat.com.sa/ar/anua-heartleaf-77-soothing-toner-250ml/p707532190" },
  { productId: 37, storeId: 2, productUrl: "https://unitedpharmacy.sa/ar/i-m-sorry-honey-deep-hydra-serum-30ml.html" },
  { productId: 37, storeId: 4, productUrl: "https://daralamirat.com.sa/en/um-suri-for-may-skin---honey-serum,-30-ml/p1409550034" },
  { productId: 37, storeId: 5, productUrl: "https://www.whites.sa/en-sa/i-m-sorry-for-my-skin-honey-beam-ampoule-30-ml/" },
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
