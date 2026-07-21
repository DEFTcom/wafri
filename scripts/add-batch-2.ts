// الدفعة الثانية: 5 منتجات عناية بالشعر (categoryId = 2) بالروابط المُختبرة فعلياً
// المتاجر: 1 النهدي، 2 المتحدة، 3 نايس ون، 4 دار الأميرات، 5 وايتس
import { db, products, storeOffers } from "../src/db";
import { uniqueProductSlug } from "../src/lib/slug";

const HAIR_CATEGORY = 2;

const BATCH: {
  nameAr: string;
  brand: string;
  size: string;
  offers: Record<number, string>;
}[] = [
  {
    nameAr: "أو جي إكس شامبو بالبيوتين والكولاجين",
    brand: "OGX",
    size: "385ml",
    offers: {
      1: "https://www.nahdionline.com/ar-sa/ogx-thick-full-biotin-collagen-shampoo-385ml/pdp/101038622",
      2: "https://unitedpharmacy.sa/ar/ogx-shampoo-biotin-and-collagen-385-ml.html",
      3: "https://niceonesa.com/en/ogx-thick-and-full-biotin-collagen-shampoo-385ml-n8579",
      4: "https://daralamirat.com.sa/en/or-gx-shampoo-biotin-and-collagen-plus-385-ml/p2076833569",
      5: "https://www.whites.sa/en-sa/biotin-collagen-shampoo-385ml/",
    },
  },
  {
    nameAr: "أو جي إكس شامبو مغذٍ بحليب جوز الهند",
    brand: "OGX",
    size: "385ml",
    offers: {
      1: "https://www.nahdionline.com/ar-sa/ogx-nourishing-coconut-milk-shampoo-385ml/pdp/101040167",
      2: "https://unitedpharmacy.sa/ar/ogx-nourishing-coconut-milk-shampoo-385ml.html",
      3: "https://niceonesa.com/en/care-hair-care-shampoo-amp-conditioners-ogx-nourishing-coconut-milk-shampoo-385ml-n8527",
      4: "https://daralamirat.com.sa/en/or-gx-shampoo-coconut-385-ml/p1544014119",
      5: "https://www.whites.sa/en-sa/nourishing-coconut-milk-shampoo-385ml/",
    },
  },
  {
    nameAr: "أو جي إكس بلسم بالبيوتين والكولاجين",
    brand: "OGX",
    size: "385ml",
    offers: {
      1: "https://www.nahdionline.com/ar-sa/ogx-thick-full-biotin-collagen-conditioner-385-ml/pdp/101038631",
      3: "https://niceonesa.com/en/ogx-thick-and-full-biotin-collagen-conditioner-385ml-n8541",
      5: "https://www.whites.sa/en-sa/ogx-thick-full-biotin-collagen-conditioner-385-ml/",
    },
  },
  {
    nameAr: "لوريال إلفيف زيت استثنائي بالتركيبة الغنية للشعر الجاف",
    brand: "L'Oréal",
    size: "100ml",
    offers: {
      1: "https://www.nahdionline.com/ar-sa/elvive-extraordinary-oil-extra-rich-for-dried-out-hair-100-ml/pdp/100917609",
      2: "https://unitedpharmacy.sa/ar/elvive-extra-ordinary-oil-extra-rich-100-ml.html",
    },
  },
  {
    nameAr: "تريسمي شامبو التغذية بجوز الهند",
    brand: "TRESemmé",
    size: "600ml",
    offers: {
      1: "https://www.nahdionline.com/ar-sa/tresemm-shampoo-coconut-nourish-600ml/pdp/101695770",
      2: "https://unitedpharmacy.sa/ar/tresemme-shampoo-with-coconut-milk-aloe-vera-nourish-replenish-for-dry-hair-600ml.html",
    },
  },
];

(async () => {
  for (const item of BATCH) {
    const [product] = await db
      .insert(products)
      .values({
        nameAr: item.nameAr,
        slug: await uniqueProductSlug(item.nameAr, item.size),
        brand: item.brand,
        categoryId: HAIR_CATEGORY,
        sizeVariant: item.size,
      })
      .returning();

    await db.insert(storeOffers).values(
      Object.entries(item.offers).map(([storeId, url]) => ({
        productId: product.id,
        storeId: Number(storeId),
        productUrl: url,
      }))
    );
    console.log(`✓ ${product.id}: ${item.nameAr} (${Object.keys(item.offers).length} عروض)`);
  }
  process.exit(0);
})();
