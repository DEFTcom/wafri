// إضافة عروض متاجر حقيقية مؤكدة لمنتجات كانت بمتجر واحد
import { db, storeOffers } from "../src/db";

const NEW_OFFERS: { productId: number; storeId: number; url: string }[] = [
  {
    productId: 1, // بيوتي أوف جوسون واقي شمس بالأرز SPF50 50ml
    storeId: 3,
    url: "https://niceonesa.com/en/beauty-of-joseon-relief-sun-rice-probiotics-spf50-pa-50ml-n23528",
  },
  {
    productId: 2, // يوسيرين جل منظف للبشرة الدهنية 200ml
    storeId: 1,
    url: "https://www.nahdionline.com/ar-sa/eucerin-cleanser-dermopurifyer-for-oily-skin-200-ml/pdp/100673376",
  },
  {
    productId: 2,
    storeId: 3,
    url: "https://niceonesa.com/en/eucerin-dermo-purifyer-oil-control-cleansing-gel-200ml-n9158",
  },
  {
    productId: 43, // كارميكس مرطب شفاه كلاسيك 10g
    storeId: 1,
    url: "https://www.nahdionline.com/en-sa/carmex-classic-lip-balm-in-tube-10-gm/pdp/101856756",
  },
  {
    productId: 87, // غارنييه ألترا دو قناع الشعر 390ml
    storeId: 1,
    url: "https://www.nahdionline.com/ar-sa/ultra-doux-smoothing-coconut-3-in-1-hair-food-for-frizzy-and-unruly-hair-390-ml/pdp/101696633",
  },
  {
    productId: 94, // سيرافي منظف رغوي 236ml
    storeId: 2,
    url: "https://unitedpharmacy.sa/ar/cerave-foaming-cleanser-for-normal-to-oily-skin-236-ml.html",
  },
];

(async () => {
  for (const o of NEW_OFFERS) {
    await db.insert(storeOffers).values({
      productId: o.productId,
      storeId: o.storeId,
      productUrl: o.url,
    });
    console.log(`✓ أُضيف عرض للمنتج ${o.productId} بالمتجر ${o.storeId}`);
  }
  process.exit(0);
})();
