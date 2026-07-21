import { genericScraper } from "../generic";
import type { StoreScraper } from "../types";

// سكربت مخصص لكل متجر — الكل يبدأ بالعام (JSON-LD + محددات من scraper_config)،
// وأي متجر يحتاج منطق خاص (API داخلي، Playwright) يُستبدل هنا بملف مستقل.
const registry: Record<string, StoreScraper> = {
  "nahdionline.com": genericScraper,
  "unitedpharmacy.sa": genericScraper,
  "niceonesa.com": genericScraper,
  "daralamirat.com.sa": genericScraper,
  "whites.sa": genericScraper,
};

export function getScraper(baseDomain: string): StoreScraper {
  return registry[baseDomain] ?? genericScraper;
}
