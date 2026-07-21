// الدفعة الرابعة: 38 منتجاً موزعة على 7 أقسام، بروابط حقيقية مؤكدة بالبحث
// المتاجر: 1 النهدي، 2 المتحدة، 3 نايس ون، 4 دار الأميرات، 5 وايتس
// الأقسام: 1 بشرة، 2 شعر، 3 جسم، 4 فم وأسنان، 5 شفاه، 6 عين، 7 يدين، 9 عناية المرأة
import { db, products, storeOffers } from "../src/db";
import { uniqueProductSlug } from "../src/lib/slug";

const BATCH: {
  nameAr: string;
  brand: string;
  size: string;
  categoryId: number;
  offers: Record<number, string>;
}[] = [
  {
    nameAr: "سيتافيل كريم مرطب للبشرة الجافة إلى الجافة جداً",
    brand: "Cetaphil",
    size: "100g",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/cetaphil-moisturizing-cream-for-dry-to-very-dry-100-gm/pdp/101075386",
    },
  },
  {
    nameAr: "كيوفي مرطب الشفاه بعامل حماية SPF30",
    brand: "QV",
    size: "15g",
    categoryId: 5,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/ego-qv-lip-balm-spf-30-15-gm/pdp/100596593",
      5: "https://www.whites.sa/ar-sa/qv-lip-balm-15-gm/",
    },
  },
  {
    nameAr: "ونس مسحات قطنية دائرية",
    brand: "Once",
    size: "90 قطعة",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/once-round-cotton-pads-90-pieces-n24757",
    },
  },
  {
    nameAr: "أنوا غسول زيتي هارتليف للتحكم في المسام",
    brand: "Anua",
    size: "200ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/care-face-care-cleansers-amp-toners-anua-heartleaf-pore-control-cleansing-oil-200ml-n25442",
    },
  },
  {
    nameAr: "بيو أويل زيت العناية بالبشرة",
    brand: "Bio-Oil",
    size: "60ml",
    categoryId: 3,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/bio-oil-skin-care-natural-60ml/pdp/101859615",
    },
  },
  {
    nameAr: "لاروش بوزيه انثيليوس يوفي ميون 400 واقي شمس سائل SPF50+",
    brand: "La Roche-Posay",
    size: "50ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/la-roche-posay-anthelios-uvmune-400-invisible-sunscreen-spf-50-50-ml/pdp/102068031",
    },
  },
  {
    nameAr: "ميلي اورجانيكس بلسم ليف ان مقوي بإكليل الجبل والنعناع",
    brand: "Mielle Organics",
    size: "355ml",
    categoryId: 2,
    offers: {
      3: "https://niceonesa.com/en/mielle-organics-rosemary-mint-strengthening-leave-in-conditioner-355ml-n23934",
    },
  },
  {
    nameAr: "فازلين لوشن العناية المركزة لليد والأظافر بالكيراتين",
    brand: "Vaseline",
    size: "75ml",
    categoryId: 7,
    offers: {
      3: "https://niceonesa.com/en/vaseline-healthy-hands-stronger-nails-with-keratin-hand-cream-75ml-n20656",
    },
  },
  {
    nameAr: "ذا أورديناري محلول تقشير AHA 30% + BHA 2%",
    brand: "The Ordinary",
    size: "30ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/the-ordinary-aha-30-bha-2-peeling-solution-30-ml/pdp/102765776",
      3: "https://niceonesa.com/en/the-ordinary-aha-30-bha-2-peeling-solution-30ml-n11712",
    },
  },
  {
    nameAr: "انرجي كوزمتكس كريم تشقير شعر الوجه والجسم",
    brand: "Energy Cosmetics",
    size: "60ml/40g",
    categoryId: 3,
    offers: {
      1: "https://www.nahdionline.com/en-sa/energy-cosmetics-facial-body-hair-bleaching-system-60ml40ml/pdp/101621914",
      3: "https://niceonesa.com/en/energy-cosmetics-facial-and-body-hair-bleaching-system-n10979",
      5: "https://www.whites.sa/en-sa/energy-cosmetics-facial-body-hair-bleaching-system-60ml-40g/",
    },
  },
  {
    nameAr: "كيوفي كريم اليدين بعامل حماية من الشمس SPF15",
    brand: "QV",
    size: "50g",
    categoryId: 7,
    offers: {
      3: "https://niceonesa.com/en/qv-hand-cream-spf-15-50g-n19514",
    },
  },
  {
    nameAr: "أداة ديرما رولر للبشرة",
    brand: "Derma Roller System",
    size: "0.50mm",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/derma-roller-system-derma-roller-for-skin-0-50mm-n11109",
    },
  },
  {
    nameAr: "ايه بي ناتشورالز كريم المايونيز الأمريكي بزيت الزيتون وبروتين البيض للشعر",
    brand: "AB Naturals",
    size: "500ml",
    categoryId: 2,
    offers: {
      3: "https://niceonesa.com/en/care-hair-care-oil-amp-masks-ab-naturals-hair-mayonnaise-olive-oil-egg-protein-500ml-n17094",
    },
  },
  {
    nameAr: "سوم باي مي كريم ريتينول المركز للعناية بمحيط العين",
    brand: "SOME BY MI",
    size: "30ml",
    categoryId: 6,
    offers: {
      3: "https://niceonesa.com/en/care-face-care-eye-care-some-by-mi-retinol-intense-advanced-triple-action-eye-cream-30ml-n23897",
    },
  },
  {
    nameAr: "فازلين مزيل رائحة رول اون لتفتيح البشرة",
    brand: "Vaseline",
    size: "45ml",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/vaseline-glutaglow-bright-dry-deodorant-serum-45ml-n39826",
    },
  },
  {
    nameAr: "كارمكس فريش تشيري مرطب الشفاه",
    brand: "Carmex",
    size: "10g",
    categoryId: 5,
    offers: {
      3: "https://niceonesa.com/en/care/face-care/lip-care/carmex-fresh-cherry-lip-balm-medicated-10g-n14558/",
    },
  },
  {
    nameAr: "أنوا تونر مهدئ هارتليف 77%",
    brand: "Anua",
    size: "250ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/anua-heartleaf-77-soothing-toner-250ml-n25443",
    },
  },
  {
    nameAr: "بودي بلندز محلول AHA لتقشير الوجه",
    brand: "BodyBlendz",
    size: "30ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/bodyblendz-aha-facial-peeling-solution-30ml-n16675",
    },
  },
  {
    nameAr: "غارنييه ألترا دو قناع الشعر المغذي 3 في 1 بجوز الهند",
    brand: "Garnier",
    size: "390ml",
    categoryId: 2,
    offers: {
      3: "https://niceonesa.com/en/garnier-ultra-doux-smoothing-coconut-3-in-1-hair-food-390ml-n14900",
    },
  },
  {
    nameAr: "ناو زيت الخروع نقي 100%",
    brand: "NOW",
    size: "118ml",
    categoryId: 3,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/now-castror-oil-100-pure-118ml/pdp/101706627",
      4: "https://daralamirat.com.sa/en/now-foods-castor-oil/p1864214932",
    },
  },
  {
    nameAr: "سكينلاريتي شفرات حلاقة الشعر الوبري",
    brand: "Skinlarity",
    size: "3 قطع",
    categoryId: 9,
    offers: {
      3: "https://niceonesa.com/en/skinlarity-fuzz-off-razor-3-pieces-n24964",
    },
  },
  {
    nameAr: "يوسيرين كريم إصلاح اليدين المتقدم خالي من العطور",
    brand: "Eucerin",
    size: "78g",
    categoryId: 7,
    offers: {
      3: "https://niceonesa.com/en/eucerin-advanced-repair-hand-creme-fragrance-free-for-dry-skin-78g-n20298",
    },
  },
  {
    nameAr: "سمرز ايف غسول ليلي للمناطق الحساسة بالافندر",
    brand: "Summer's Eve",
    size: "354ml",
    categoryId: 9,
    offers: {
      1: "https://www.nahdionline.com/en-sa/summers-eve-lavender-nighttime-intimate-wash-12-fl-oz/pdp/103531664",
    },
  },
  {
    nameAr: "ناو زيت الجلسرين النباتي نقي 100%",
    brand: "NOW",
    size: "118ml",
    categoryId: 3,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/now-glycerin-oil-100-pure-120ml/pdp/102369677",
    },
  },
  {
    nameAr: "فيم فريش بخاخ منعش للمناطق الحميمية",
    brand: "FemFresh",
    size: "125ml",
    categoryId: 9,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/femfresh-deo-spray-125-ml/pdp/100746281",
      3: "https://niceonesa.com/en/femfresh-freshness-deodorant-125ml-n15340",
      4: "https://daralamirat.com.sa/femfresh-deo-spray-125-ml.html",
    },
  },
  {
    nameAr: "سيرافي منظف البشرة الرغوي للبشرة العادية والدهنية",
    brand: "CeraVe",
    size: "236ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/cerave-foaming-cleanser-for-normal-to-oily-skin-with-hyaluronic-acid-236-ml/pdp/101892677",
    },
  },
  {
    nameAr: "تنج برش جل اللسان بالنعناع المنعش",
    brand: "Tung Brush",
    size: "85g",
    categoryId: 4,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/tung-gel-fresh-mint-tongue-cleaner-85ml/pdp/101979625",
      3: "https://niceonesa.com/en/tung-brush-peak-essentials-the-original-tung-gel-fresh-mint-85g-n11076",
    },
  },
  {
    nameAr: "اكسيس واي سيروم التوهج لتصحيح البقع الداكنة",
    brand: "AXIS-Y",
    size: "50ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/axis-y-dark-spot-correcting-glow-serum-50-ml-n26091",
    },
  },
  {
    nameAr: "كوسركس غسول يومي لطيف بحمض الساليسيليك",
    brand: "COSRX",
    size: "150ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/cosrx-salicylic-acid-daily-gentle-cleanser/pdp/102709846",
      2: "https://unitedpharmacy.sa/ar/cosrx-gentl-daily-clean-salicylic-150ml.html",
      3: "https://niceonesa.com/en/cosrx-salicylic-acid-daily-gentle-cleanser-150ml-n22453",
    },
  },
  {
    nameAr: "فيم فريش غسول يومي للمناطق الحميمية مع الصبار",
    brand: "FemFresh",
    size: "250ml",
    categoryId: 9,
    offers: {
      1: "https://www.nahdionline.com/en-sa/femfresh-wash-250-ml/pdp/100746256",
      3: "https://niceonesa.com/en/femfresh-daily-intimate-wash-with-aloe-vera-250ml-n15343",
    },
  },
  {
    nameAr: "ناو زيت اكليل الجبل العضوي",
    brand: "NOW",
    size: "30ml",
    categoryId: 2,
    offers: {
      1: "https://www.nahdionline.com/ar-ae/now-rosemary-oil-organic-30ml/pdp/103278654",
    },
  },
  {
    nameAr: "لابيلو مرطب شفاه بلاك بيري شاين",
    brand: "Labello",
    size: "4.8g",
    categoryId: 5,
    offers: {
      3: "https://niceonesa.com/en/labello-blackberry-shine-caring-lip-balm-4-8gm-n10966",
    },
  },
  {
    nameAr: "سيليا مقشر سكر رغوي بالرمان والفانيلا",
    brand: "Celia",
    size: "600g",
    categoryId: 3,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/celia-shower-sugar-scrub-pomegranate-vanilla-600g/pdp/102086642",
      3: "https://niceonesa.com/en/celia-shower-sugar-scrub-pomegranate-vanilla-600gm-n20106",
    },
  },
  {
    nameAr: "بيوتي أوف جوسون سيروم النضارة بخلاصة العسل والنياسيناميد",
    brand: "Beauty of Joseon",
    size: "30ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/care-face-care-face-moisturizer-beauty-of-joseon-glow-serum-propolis-niacinamide-30ml-n24737",
    },
  },
  {
    nameAr: "باراشوت زيت جوز الهند النقي 100%",
    brand: "Parachute",
    size: "175ml",
    categoryId: 2,
    offers: {
      3: "https://niceonesa.com/en/parachute-100-pure-coconut-oil-175ml-n18242",
    },
  },
  {
    nameAr: "اجمل بودرة معطرة للجسم اوروم سمر للنساء",
    brand: "Ajmal",
    size: "100g",
    categoryId: 9,
    offers: {
      3: "https://niceonesa.com/en/ajmal-aurum-summer-perfumed-body-powder-for-women-100gm-n21919",
    },
  },
  {
    nameAr: "سوم باي مي كريم المعجزة لمدة 30 يوماً",
    brand: "SOME BY MI",
    size: "60g",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/some-by-mi-aha-bha-pha-30-days-miracle-cream-60g-n15816",
    },
  },
  {
    nameAr: "جيوفاني شامبو زيت شجرة الشاي الثلاثي المعالج والمقوي للشعر",
    brand: "Giovanni",
    size: "250ml",
    categoryId: 2,
    offers: {
      3: "https://niceonesa.com/en/giovanni-tea-tree-triple-treat-shampoo-250ml-n18217",
      4: "https://daralamirat.com.sa/en/giovanni---a-refreshing-shampoo-with-a-tea-tree-extract-250-ml/p775365617",
    },
  },
];

(async () => {
  let added = 0;
  for (const item of BATCH) {
    const [product] = await db
      .insert(products)
      .values({
        nameAr: item.nameAr,
        slug: await uniqueProductSlug(item.nameAr, item.size),
        brand: item.brand,
        categoryId: item.categoryId,
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
    added++;
    console.log(`✓ ${product.id}: ${item.nameAr} (${Object.keys(item.offers).length} عروض)`);
  }
  console.log(`\nإجمالي: ${added} منتج أُضيف.`);
  process.exit(0);
})();
