// الدفعة الأولى: 5 منتجات عناية بالبشرة بعروضها بالمتاجر
// المتاجر: 1 النهدي، 2 المتحدة، 3 نايس ون، 4 دار الأميرات، 5 وايتس
import { db, products, storeOffers } from "../src/db";
import { uniqueProductSlug } from "../src/lib/slug";

const BATCH: {
  nameAr: string;
  brand: string;
  size: string;
  offers: Record<number, string>;
}[] = [
  {
    nameAr: "سيتافيل غسول منظف لطيف للبشرة الجافة إلى العادية",
    brand: "Cetaphil",
    size: "500ml",
    offers: {
      1: "https://www.nahdionline.com/ar/cetaphil-gentle-skin-cleanser-500-ml",
      2: "https://unitedpharmacy.sa/ar/cetaphil-gentle-skin-cleanser-500-ml.html",
      5: "https://www.whites.sa/en-sa/cetaphil-gentle-skin-cleanser-500ml/",
    },
  },
  {
    nameAr: "بيوديرما سنسيبيو H2O ماء ميسيلار للبشرة الحساسة",
    brand: "Bioderma",
    size: "500ml",
    offers: {
      1: "https://www.nahdionline.com/ar/bioderma-sensibio-h2o-solution-500-ml",
      2: "https://unitedpharmacy.sa/ar/bioderma-sensibio-h2o-500ml.html",
      3: "https://niceonesa.com/en/bioderma-sensibio-h2o-makeup-removing-micelle-solution-500ml-n3353",
      5: "https://www.whites.sa/en-sa/bioderma-sensibio-h2o-vb-500ml/",
    },
  },
  {
    nameAr: "ذا أورديناري سيروم نياسيناميد 10% + زنك 1%",
    brand: "The Ordinary",
    size: "30ml",
    offers: {
      1: "https://www.nahdionline.com/ar-sa/the-ordinary-niacinamide-10-zinc-1-30-ml/pdp/102765725",
      2: "https://unitedpharmacy.sa/ar/the-ordinary-niacinamide-solution-30-ml.html",
      3: "https://niceonesa.com/en/the-ordinary-niacinamide-10-zinc-1-30ml-n11790",
      4: "https://daralamirat.com.sa/en/the-ordinary-niacinamide-10-zinc-1-high-potency-vitamin-%26-mineral-complex-for-blemishes-30ml/p1422991991",
      5: "https://www.whites.sa/en-sa/the-ordinary-niacinamide-10-zinc-1-30ml/",
    },
  },
  {
    nameAr: "لاروش بوزيه انثيليوس UVMune 400 واقي شمس فلويد غير مرئي SPF50+",
    brand: "La Roche-Posay",
    size: "50ml",
    offers: {
      1: "https://www.nahdionline.com/ar-sa/la-roche-posay-anthelios-uvmune-400-invisible-sunscreen-spf-50-50-ml/pdp/102068031",
      2: "https://unitedpharmacy.sa/ar/la-roche-p-anthelios-spf50-fluid-50ml.html",
      3: "https://niceonesa.com/en/la-roche-posay-anthelios-uvmune-400-invisible-fluid-spf50-50ml-n19734",
      4: "https://daralamirat.com.sa/ar/la-roche-posay-anthelios-uvmune-invisible-spf50-400-sunscreen-50-ml/p914951485",
      5: "https://www.whites.sa/en-sa/la-roche-posay-anthelios-uvmune-400-invisible-fluid-spf50-50ml/",
    },
  },
  {
    nameAr: "سيرافي كريم مرطب للبشرة الجافة مع حمض الهيالورونيك",
    brand: "CeraVe",
    size: "340g",
    offers: {
      1: "https://www.nahdionline.com/ar-sa/cerave-moisturizing-cream-for-dry-skin-with-hyaluronic-acid-340-gm/pdp/101892634",
      2: "https://unitedpharmacy.sa/ar/cerave-moisturizing-cream-for-dry-skin-340-gm.html",
      3: "https://niceonesa.com/en/cerave-moisturising-cream-340-g-n18751",
      4: "https://daralamirat.com.sa/en/cerave-moisturizing-facial-cream-340-ml/p1786869411",
      5: "https://www.whites.sa/en-sa/moisturizing-cream-for-dry-skin-with-hyaluronic-acid-340g/",
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
        categoryId: 1, // العناية بالبشرة
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
