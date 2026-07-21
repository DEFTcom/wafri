// اختبار مسبق لروابط دفعة الشعر: يسحب كل رابط فعلياً ويطبع الاسم والسعر
// قبل الإضافة — الروابط الفاشلة أو المختلفة الحجم تُستبعد يدوياً بعدها.
import { getScraper } from "../src/scrapers/stores";

const CANDIDATES: { product: string; store: string; domain: string; url: string }[] = [
  // ١) OGX شامبو بيوتين وكولاجين 385مل
  { product: "OGX-بيوتين-شامبو", store: "النهدي", domain: "nahdionline.com", url: "https://www.nahdionline.com/ar-sa/ogx-thick-full-biotin-collagen-shampoo-385ml/pdp/101038622" },
  { product: "OGX-بيوتين-شامبو", store: "المتحدة", domain: "unitedpharmacy.sa", url: "https://unitedpharmacy.sa/ar/ogx-shampoo-biotin-and-collagen-385-ml.html" },
  { product: "OGX-بيوتين-شامبو", store: "نايس ون", domain: "niceonesa.com", url: "https://niceonesa.com/en/ogx-thick-and-full-biotin-collagen-shampoo-385ml-n8579" },
  { product: "OGX-بيوتين-شامبو", store: "دار الأميرات", domain: "daralamirat.com.sa", url: "https://daralamirat.com.sa/en/or-gx-shampoo-biotin-and-collagen-plus-385-ml/p2076833569" },
  { product: "OGX-بيوتين-شامبو", store: "وايتس", domain: "whites.sa", url: "https://www.whites.sa/en-sa/biotin-collagen-shampoo-385ml/" },

  // ٢) OGX شامبو حليب جوز الهند 385مل
  { product: "OGX-جوزهند-شامبو", store: "النهدي", domain: "nahdionline.com", url: "https://www.nahdionline.com/ar-sa/ogx-nourishing-coconut-milk-shampoo-385ml/pdp/101040167" },
  { product: "OGX-جوزهند-شامبو", store: "المتحدة", domain: "unitedpharmacy.sa", url: "https://unitedpharmacy.sa/ar/ogx-nourishing-coconut-milk-shampoo-385ml.html" },
  { product: "OGX-جوزهند-شامبو", store: "نايس ون", domain: "niceonesa.com", url: "https://niceonesa.com/en/care-hair-care-shampoo-amp-conditioners-ogx-nourishing-coconut-milk-shampoo-385ml-n8527" },
  { product: "OGX-جوزهند-شامبو", store: "دار الأميرات", domain: "daralamirat.com.sa", url: "https://daralamirat.com.sa/en/or-gx-shampoo-coconut-385-ml/p1544014119" },
  { product: "OGX-جوزهند-شامبو", store: "وايتس (تخمين)", domain: "whites.sa", url: "https://www.whites.sa/en-sa/ogx-nourishing-coconut-milk-shampoo-385-ml/" },

  // ٣) OGX بلسم بيوتين وكولاجين 385مل
  { product: "OGX-بيوتين-بلسم", store: "النهدي", domain: "nahdionline.com", url: "https://www.nahdionline.com/ar-sa/ogx-thick-full-biotin-collagen-conditioner-385-ml/pdp/101038631" },
  { product: "OGX-بيوتين-بلسم", store: "المتحدة (تخمين)", domain: "unitedpharmacy.sa", url: "https://unitedpharmacy.sa/ar/ogx-conditioner-biotin-and-collagen-385-ml.html" },
  { product: "OGX-بيوتين-بلسم", store: "نايس ون", domain: "niceonesa.com", url: "https://niceonesa.com/en/ogx-thick-and-full-biotin-collagen-conditioner-385ml-n8541" },
  { product: "OGX-بيوتين-بلسم", store: "وايتس", domain: "whites.sa", url: "https://www.whites.sa/en-sa/ogx-thick-full-biotin-collagen-conditioner-385-ml/" },

  // ٤) إلفيف زيت استثنائي غني للشعر الجاف 100مل
  { product: "الفيف-زيت", store: "النهدي", domain: "nahdionline.com", url: "https://www.nahdionline.com/ar-sa/elvive-extraordinary-oil-extra-rich-for-dried-out-hair-100-ml/pdp/100917609" },
  { product: "الفيف-زيت", store: "المتحدة", domain: "unitedpharmacy.sa", url: "https://unitedpharmacy.sa/ar/elvive-extra-ordinary-oil-extra-rich-100-ml.html" },
  { product: "الفيف-زيت", store: "وايتس (تخمين)", domain: "whites.sa", url: "https://www.whites.sa/en-sa/loreal-paris-elvive-extraordinary-oil-extra-rich-100ml/" },

  // ٥) تريسمي شامبو تغذية جوز الهند 600مل
  { product: "تريسمي-جوزهند-600", store: "النهدي", domain: "nahdionline.com", url: "https://www.nahdionline.com/ar-sa/tresemm-shampoo-coconut-nourish-600ml/pdp/101695770" },
  { product: "تريسمي-جوزهند-600", store: "المتحدة", domain: "unitedpharmacy.sa", url: "https://unitedpharmacy.sa/ar/tresemme-shampoo-with-coconut-milk-aloe-vera-nourish-replenish-for-dry-hair-600ml.html" },
  { product: "تريسمي-جوزهند-600", store: "وايتس (تخمين)", domain: "whites.sa", url: "https://www.whites.sa/en-sa/tresemme-shampoo-coconut-nourish-600ml/" },
];

(async () => {
  for (const c of CANDIDATES) {
    try {
      const r = await getScraper(c.domain).scrapeProduct(c.url, {});
      console.log(`OK  | ${c.product} | ${c.store} | ${r.price} | ${r.available ? "متوفر" : "نافد"} | ${r.title.slice(0, 60)}`);
    } catch (e) {
      console.log(`FAIL| ${c.product} | ${c.store} | ${e instanceof Error ? e.message.slice(0, 70) : e}`);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  process.exit(0);
})();
