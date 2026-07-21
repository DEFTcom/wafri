// جولة تخمينات ثانية للروابط الفاشلة — أنماط سلاقات معروفة لكل متجر
import { getScraper } from "../src/scrapers/stores";

const CANDIDATES: { label: string; domain: string; url: string }[] = [
  // وايتس: شامبو جوز الهند (نمط بدون ogx مثل شامبو البيوتين)
  { label: "وايتس-جوزهند-1", domain: "whites.sa", url: "https://www.whites.sa/en-sa/nourishing-coconut-milk-shampoo-385ml/" },
  { label: "وايتس-جوزهند-2", domain: "whites.sa", url: "https://www.whites.sa/en-sa/ogx-nourishing-coconut-milk-shampoo-385ml/" },
  { label: "وايتس-جوزهند-3", domain: "whites.sa", url: "https://www.whites.sa/en-sa/coconut-milk-shampoo-385ml/" },
  // وايتس: إلفيف زيت
  { label: "وايتس-الفيف-1", domain: "whites.sa", url: "https://www.whites.sa/en-sa/elvive-extraordinary-oil-extra-rich-100ml/" },
  { label: "وايتس-الفيف-2", domain: "whites.sa", url: "https://www.whites.sa/en-sa/elvive-extraordinary-oil-100ml/" },
  // وايتس: تريسمي جوز الهند 600
  { label: "وايتس-تريسمي-1", domain: "whites.sa", url: "https://www.whites.sa/en-sa/tresemme-coconut-nourish-shampoo-600ml/" },
  { label: "وايتس-تريسمي-2", domain: "whites.sa", url: "https://www.whites.sa/en-sa/tresemme-shampoo-coconut-nourish-600-ml/" },
  // المتحدة: بلسم OGX بيوتين
  { label: "متحدة-بلسم-1", domain: "unitedpharmacy.sa", url: "https://unitedpharmacy.sa/ar/ogx-biotin-and-collagen-conditioner-385-ml.html" },
  { label: "متحدة-بلسم-2", domain: "unitedpharmacy.sa", url: "https://unitedpharmacy.sa/ar/ogx-conditioner-biotin-collagen-385ml.html" },
];

(async () => {
  for (const c of CANDIDATES) {
    try {
      const r = await getScraper(c.domain).scrapeProduct(c.url, {});
      console.log(`OK  | ${c.label} | ${r.price} | ${r.title.slice(0, 60)}`);
    } catch (e) {
      console.log(`FAIL| ${c.label} | ${e instanceof Error ? e.message.slice(0, 60) : e}`);
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  process.exit(0);
})();
