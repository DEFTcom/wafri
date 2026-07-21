// الدفعة الثالثة: 55 منتجاً موزعة على 7 أقسام، بروابط حقيقية مؤكدة بالبحث
// المتاجر: 1 النهدي، 2 المتحدة، 3 نايس ون، 4 دار الأميرات، 5 وايتس
// الأقسام: 1 بشرة، 2 شعر، 3 جسم، 4 فم وأسنان، 5 شفاه، 6 عين، 7 يدين
import { db, products, storeOffers } from "../src/db";
import { uniqueProductSlug } from "../src/lib/slug";

const BATCH: {
  nameAr: string;
  brand: string;
  size: string;
  categoryId: number;
  offers: Record<number, string>;
}[] = [
  // ── العناية بالشعر (2) ──────────────────────────────────────────────
  {
    nameAr: "ميلي اورجانيكس زيت اكليل الجبل والنعناع لتقوية الشعر وفروة الرأس",
    brand: "Mielle Organics",
    size: "59ml",
    categoryId: 2,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/mielle-rosemary-mint-light-hair-strengthening-oil-59-ml/pdp/103637928",
      3: "https://niceonesa.com/en/mielle-organics-rosemary-mint-scalp-hair-strengthening-oil-59ml-n23627",
    },
  },
  {
    nameAr: "ميلي اورجانيكس شامبو مقوي بإكليل الجبل والنعناع",
    brand: "Mielle Organics",
    size: "355ml",
    categoryId: 2,
    offers: {
      1: "https://www.nahdionline.com/en-sa/mielle-organics-rosemary-mint-strengthening-shampoo-355-ml/pdp/102847552",
      3: "https://niceonesa.com/en/mielle-organics-rosemary-mint-strengthening-shampoo-355ml-n23936",
    },
  },
  {
    nameAr: "ميلي اورجانيكس قناع تقوية الشعر بإكليل الجبل والنعناع",
    brand: "Mielle Organics",
    size: "340g",
    categoryId: 2,
    offers: {
      1: "https://nahdionline.com/en/mielle-organics-rosemary-mint-strengthening-hair-mask-340-gm",
      3: "https://niceonesa.com/en/mielle-organics-rosemary-mint-strengthening-hair-masque-340-g-n23933",
    },
  },
  {
    nameAr: "تريسمي بخاخ حماية الشعر من الحرارة حتى 450 درجة",
    brand: "TRESemmé",
    size: "236ml",
    categoryId: 2,
    offers: {
      3: "https://niceonesa.com/en/tresemme-thermal-creations-heat-protection-up-to-450f-leave-in-spray-236ml-n19260",
    },
  },
  {
    nameAr: "شيسيدو فينو بريميوم تاتش قناع الشعر",
    brand: "Shiseido",
    size: "230g",
    categoryId: 2,
    offers: {
      3: "https://niceonesa.com/en/shiseido-fino-premium-touch-hair-mask-230gm-n26175",
    },
  },

  // ── العناية بالبشرة (1) ─────────────────────────────────────────────
  {
    nameAr: "ذا أورديناري تونر مقشر بحمض الجليكوليك 7%",
    brand: "The Ordinary",
    size: "240ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/the-ordinary-glycolic-acid-7-toning-solution-240-ml/pdp/102765792",
      3: "https://niceonesa.com/en/the-ordinary-glycolic-acid-7-exfoliating-toner-240ml-n11689",
    },
  },
  {
    nameAr: "اكيور مقشر الوجه للتفتيح",
    brand: "Acure",
    size: "118ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/acure-brightening-facial-scrub-118ml-n1623",
      4: "https://daralamirat.com.sa/ar/acure-brightening-facial-scrub-118ml/p1546950953",
    },
  },
  {
    nameAr: "سوم باي مي مجموعة روتين العناية AHA BHA PHA لمدة 30 يوماً",
    brand: "SOME BY MI",
    size: "4 قطع",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/some-by-mi-aha-bha-pha-30-days-miracle-starter-4-piece-n13285",
    },
  },
  {
    nameAr: "كيلان لصقات تنظيف الأنف",
    brand: "Kilan",
    size: "4 قطع",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/kaylan-deep-pore-cleansing-strips-n857",
    },
  },
  {
    nameAr: "اوز ناتشورال سيروم فيتامين سي للوجه",
    brand: "OZNaturals",
    size: "30ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/oznaturals-vitamin-c-facial-serum-30ml-n112",
    },
  },
  {
    nameAr: "ذا أورديناري سيروم حمض الهيالورونيك 2% + بي5",
    brand: "The Ordinary",
    size: "30ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/the-ordinary-hyaluronic-acid-2-b5-30-ml/pdp/102765784",
    },
  },
  {
    nameAr: "بيبانثين كريم مرطب للجلد",
    brand: "Bepanthen",
    size: "30g",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/bepanthen-skin-moisturizer-cream-30-gm/pdp/101609923",
      2: "https://unitedpharmacy.sa/ar/bepanthen-skin-moisturizing-cream-30-gm.html",
      3: "https://niceonesa.com/en/bepanthen-skin-moisturizer-30gm-n17107",
    },
  },
  {
    nameAr: "اوز ناتشورال سيروم حمض الهيالورونيك للوجه",
    brand: "OZNaturals",
    size: "30ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/en-sa/oznaturals-hyaluronic-serum-30-ml/pdp/101766662",
      3: "https://niceonesa.com/en/care-face-care-face-moisturizer-oznaturals-hyaluronic-acid-facial-serum-30ml-n2131",
    },
  },
  {
    nameAr: "بيوديرما جل منظف سيبيوم",
    brand: "Bioderma",
    size: "500ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/bioderma-sbium-gel-moussant-n6232",
    },
  },
  {
    nameAr: "كوسركس كريم الحلزون 92 المطور الكل في واحد",
    brand: "COSRX",
    size: "100g",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/cosrx-advanced-snail-92-all-in-one-cream-100g-n22458",
    },
  },
  {
    nameAr: "كوسركس مستخلص موسين باور 96 بتركيبة الحلزون المتقدمة",
    brand: "COSRX",
    size: "100ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/cosrx-advanced-snail-96-mucin-power-essence-100ml-n22459",
    },
  },
  {
    nameAr: "سوم باي مي تونر العناية AHA BHA PHA",
    brand: "SOME BY MI",
    size: "150ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/some-by-mi-aha-bha-pha-30-days-miracle-toner-150ml-n13521",
    },
  },
  {
    nameAr: "سوم باي مي لصقات المعجزة لعلاج الحبوب والآثار",
    brand: "SOME BY MI",
    size: "18 لاصقة",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/care-face-care-facial-masks-some-by-mi-30-days-miracle-acne-clear-spot-patch-18-pieces-n17349",
    },
  },
  {
    nameAr: "بانوكسيل غسول رغوي لحب الشباب بنزويل بيروكسيد 10%",
    brand: "PanOxyl",
    size: "156g",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/panoxyl-acne-foaming-wash-10-benzoyl-peroxide-156g/pdp/102828263",
      3: "https://niceonesa.com/en/panoxyl-acne-foaming-wash-10-benzoyl-peroxide-maximum-strength-156g-n21442",
    },
  },
  {
    nameAr: "إيليشاكوي قناع النوم بالكولاجين لترطيب البشرة",
    brand: "Elishacoy",
    size: "50ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/en-sa/elishacoy-moist-up-collagen-sleeping-mask-50ml/pdp/103247911",
    },
  },
  {
    nameAr: "امبريوليس كريم الترطيب العميق",
    brand: "Embryolisse",
    size: "75ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/embryolisse-lait-creme-concentred-75-ml/pdp/102147610",
      3: "https://niceonesa.com/en/embryolisse-lait-creme-concentre-75ml-n21423",
      4: "https://daralamirat.com.sa/en/imperioles---center-cream,-multi-functional-moisturizer---75-ml/p788259837",
    },
  },
  {
    nameAr: "غارنييه سيروم سكين اكتيف فيتامين سي للوجه",
    brand: "Garnier",
    size: "30ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/en-sa/garnier-skin-active-fast-bright-vitamin-c-serum-30-ml/pdp/101795623",
    },
  },
  {
    nameAr: "ايم سوري فور ماي سكن أمبولة العسل",
    brand: "I'm Sorry For My Skin",
    size: "30ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/i-m-sorry-for-my-skin-honey-beam-ampoule-30ml-n19889",
    },
  },
  {
    nameAr: "ناتشر ريبورت جل الصبار المرطب والمهدئ",
    brand: "Nature Republic",
    size: "300ml",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/nature-republic-aloe-vera-soothing-gel-300ml-n135",
    },
  },
  {
    nameAr: "سوم باي مي منظف الفقاعات للرؤوس السوداء",
    brand: "SOME BY MI",
    size: "120g",
    categoryId: 1,
    offers: {
      3: "https://niceonesa.com/en/care-face-care-cleansers-amp-toners-some-by-mi-bye-bye-blackhead-30-days-miracle-green-tea-tox-bubble-cleanser-120g-n14461",
    },
  },
  {
    nameAr: "اكيور غسول جل لتفتيح البشرة",
    brand: "Acure",
    size: "118ml",
    categoryId: 1,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/acure-skin-lightening-cleansing-gel-118-ml/pdp/102851130",
      3: "https://niceonesa.com/en/acure-brightening-cleansing-gel-118ml-n19273",
    },
  },

  // ── العناية بالشفاه (5) ─────────────────────────────────────────────
  {
    nameAr: "فازلين مرطب ومورد للشفاه",
    brand: "Vaseline",
    size: "20g",
    categoryId: 5,
    offers: {
      3: "https://niceonesa.com/en/vaseline-lip-therapy-rosy-20gm-n21883",
    },
  },
  {
    nameAr: "لانيج قناع الشفاه المرطب الليلي — بيري",
    brand: "Laneige",
    size: "20g",
    categoryId: 5,
    offers: {
      3: "https://niceonesa.com/en/laneige-lip-sleeping-mask-berry-n13345",
    },
  },
  {
    nameAr: "كارميكس مرطب شفاه كلاسيك ميدكيت",
    brand: "Carmex",
    size: "10g",
    categoryId: 5,
    offers: {
      3: "https://niceonesa.com/en/carmex-classic-lip-balm-medicated-10g-n13459",
    },
  },

  // ── العناية بالعين (6) ──────────────────────────────────────────────
  {
    nameAr: "ذا أورديناري سيروم كافيين 5% + EGCG لمعالجة هالات العين",
    brand: "The Ordinary",
    size: "30ml",
    categoryId: 6,
    offers: {
      3: "https://niceonesa.com/en/the-ordinary-caffeine-solution-5-egcg-30ml-n11906",
    },
  },
  {
    nameAr: "بودي بلندز سيروم نمو الرموش والحواجب",
    brand: "BodyBlendz",
    size: "10ml",
    categoryId: 6,
    offers: {
      3: "https://niceonesa.com/en/care-face-care-eye-care-bodyblendz-lash-amp-brow-growth-serum-10-ml-n16676",
    },
  },
  {
    nameAr: "جيجون لصقات جل للعين بالشاي الأخضر",
    brand: "Jayjun",
    size: "60 لاصقة",
    categoryId: 6,
    offers: {
      3: "https://niceonesa.com/en/jayjun-green-tea-eye-gel-patch-1-4g-x-60ea-n11102",
      4: "https://daralamirat.com.sa/ar/%D9%84%D8%B5%D9%82%D8%A7%D8%AA-%D8%AC%D9%84-%D9%84%D9%84%D8%B9%D9%8A%D9%86-%D8%A8%D8%A7%D9%84%D8%B4%D8%A7%D9%8A-%D8%A7%D9%84%D8%A7%D8%AE%D8%B6%D8%B1-%D9%85%D9%86-%D8%AC%D9%8A%D8%AC%D9%88%D9%86-14%D8%BA60-%D9%84%D8%A7%D8%B5%D9%82%D8%A9/p270652353",
    },
  },

  // ── العناية باليدين (7) ─────────────────────────────────────────────
  {
    nameAr: "فازلين لوشن العناية المركزة لليد والأظافر",
    brand: "Vaseline",
    size: "100ml",
    categoryId: 7,
    offers: {
      3: "https://niceonesa.com/en/vaseline-healthy-hands-stronger-nails-lotion-100ml-n15364",
      4: "https://daralamirat.com.sa/ar/puritan-care-lotion-for-hand-and-nail-from-vaseline---100-ml/p1255789637",
    },
  },
  {
    nameAr: "مافالا مقوي الأظافر سيانتيفيك كي+",
    brand: "Mavala",
    size: "5ml",
    categoryId: 7,
    offers: {
      3: "https://niceonesa.com/en/mavala-scientifique-k-nail-hardener-5ml-n2890",
    },
  },
  {
    nameAr: "إيفلين كريم تفتيح اليدين وايت برستيج فور دي",
    brand: "Eveline",
    size: "100ml",
    categoryId: 7,
    offers: {
      3: "https://niceonesa.com/en/eveline-white-prestige-4d-whitening-hand-cream-100-ml-n14589",
    },
  },
  {
    nameAr: "ليال مناديل إزالة طلاء الأظافر المعطرة",
    brand: "Layali",
    size: "24 منديل",
    categoryId: 7,
    offers: {
      3: "https://niceonesa.com/en/lyal-towelettes-nail-polish-remover-24-towelettes-n3681",
    },
  },

  // ── العناية بالفم والأسنان (4) ──────────────────────────────────────
  {
    nameAr: "بيبر منتس كرات النعناع المعطرة للفم",
    brand: "Papermints",
    size: "18 كرة",
    categoryId: 4,
    offers: {
      3: "https://niceonesa.com/en/papermints-cool-caps-18-cool-caps-n17292",
    },
  },

  // ── العناية بالجسم (3) ──────────────────────────────────────────────
  {
    nameAr: "بياري صابونة كركم أيورفيدا",
    brand: "Pyary",
    size: "75g",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/pyary-ayurvedic-soap-turmeric-n11067",
    },
  },
  {
    nameAr: "كيوفي كريم ترطيب البشرة",
    brand: "QV",
    size: "500g",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/qv-cream-replenish-your-skin-500g-n4483",
    },
  },
  {
    nameAr: "كيوفي كريم ترطيب البشرة",
    brand: "QV",
    size: "100g",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/qv-cream-replenish-your-skin-100g-n6474",
    },
  },
  {
    nameAr: "كوجي سان صابونة تفتيح كوجيك أسيد",
    brand: "Kojie San",
    size: "135g",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/kojie-san-kojic-acid-soap-skin-lightening-soap-135gm-n12578",
    },
  },
  {
    nameAr: "ناو زيت اللوز الحلو نقي 100%",
    brand: "NOW",
    size: "118ml",
    categoryId: 3,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/now-almond-oil-100-pure-118ml/pdp/101706601",
    },
  },
  {
    nameAr: "جلوبال ستار مقشر للوجه والجسم بالسكر والرمان",
    brand: "Global Star",
    size: "600g",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/globalstar-face-amp-body-sugar-scrub-with-pomegranate-600gm-n14779",
    },
  },
  {
    nameAr: "كريم كاب كريم سنفرة ومبيض للوجه والجسم",
    brand: "Krem Kap",
    size: "500g",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/krem-kap-body-face-scrubbing-exfoliating-cream-500g-n14796",
    },
  },
  {
    nameAr: "سانت ايفز مرطب الكولاجين والإيلاستين المجدد للبشرة",
    brand: "St. Ives",
    size: "283g",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/st-ives-renewing-collagen-amp-elastin-moisturizer-283g-n11065",
    },
  },
  {
    nameAr: "فازلين زيت بزبدة الكاكاو للعناية المكثفة",
    brand: "Vaseline",
    size: "200ml",
    categoryId: 3,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/vaseline-body-oil-cocoa-radiant-200-ml/pdp/101755621",
    },
  },
  {
    nameAr: "سيفيزا الليفة الكورية لتقشير الجسم — وردي",
    brand: "Safeeza",
    size: "قطعة واحدة",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/ar/safeeza-korean-loofah-for-body-exfoliation-pink-n19832",
    },
  },
  {
    nameAr: "ناو زبدة الشيا النقية 100%",
    brand: "NOW",
    size: "198g",
    categoryId: 3,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/now-shea-butter-100-pure-198-g/pdp/101872570",
      3: "https://niceonesa.com/en/now-solutions-shea-butter-198g-n142",
      4: "https://daralamirat.com.sa/en/now-shea-butter-natural-moisturizer/p1907948504",
    },
  },
  {
    nameAr: "بيوديرما كريم اتوديرم الترا",
    brand: "Bioderma",
    size: "200ml",
    categoryId: 3,
    offers: {
      1: "https://www.nahdionline.com/en-sa/bioderma-atoderm-nourishing-cream-200-ml/pdp/100571741",
      3: "https://niceonesa.com/en/bioderma-atoderm-creme-ultra-n6229",
    },
  },
  {
    nameAr: "فرانك اوليفير بودرة معطرة للجسم",
    brand: "Franck Olivier",
    size: "200g",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/franck-olivier-dusting-powder-for-the-body-200gm-n17925",
      4: "https://daralamirat.com.sa/en/frankly-body-powder-from-frank-olive---200-g/p1743861434",
    },
  },
  {
    nameAr: "كلير كريم الجسم بزبدة الكاكاو",
    brand: "Clere",
    size: "500ml",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/clere-cocoa-butter-body-cream-500ml-n3004",
    },
  },
  {
    nameAr: "يوكو ملح الحليب سبا",
    brand: "Yoko",
    size: "300g",
    categoryId: 3,
    offers: {
      1: "https://www.nahdionline.com/ar-sa/yoko-spa-milk-salt-with-vitamin-e-300-gm/pdp/103576045",
      3: "https://niceonesa.com/en/yoko-spa-milk-salt-300g-n14784",
      4: "https://daralamirat.com.sa/en/yoko-spa-milk-salt-300g/p497804147",
    },
  },
  {
    nameAr: "نوبيان هيريتج سائل استحمام الصابون الأسود الأفريقي",
    brand: "Nubian Heritage",
    size: "384ml",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/nubian-heritage-african-black-soap-body-wash-384-ml-n132",
    },
  },
  {
    nameAr: "ارم اند هامر مزيل تعرق الترا ماكس للنساء",
    brand: "Arm & Hammer",
    size: "73g",
    categoryId: 3,
    offers: {
      3: "https://niceonesa.com/en/arm-amp-hammer-ultramax-solid-antiperspirant-deodorant-active-sport-for-women-73g-n17374",
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
