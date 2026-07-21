// تشغيل السحب اليومي — يدوياً الآن، وعبر cron عند الرفع للاستضافة.
//   npm run scrape              ← كل المتاجر
//   npm run scrape -- --store 5 ← متجر واحد
//   npm run scrape -- --url https://... --store 5 ← اختبار سحب رابط واحد بدون تخزين
import { eq } from "drizzle-orm";
import { db, stores } from "../src/db";
import { runAllStores, runStoreScrape } from "../src/scrapers/runner";
import { getScraper } from "../src/scrapers/stores";
import type { ScraperConfig } from "../src/scrapers/types";

async function main() {
  const args = process.argv.slice(2);
  const flag = (name: string) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };

  const url = flag("url");
  const storeId = flag("store") ? Number(flag("store")) : undefined;

  if (url) {
    if (!storeId) throw new Error("--url يتطلب --store لتحديد إعدادات المتجر");
    const [store] = await db.select().from(stores).where(eq(stores.id, storeId));
    if (!store) throw new Error(`لا يوجد متجر برقم ${storeId}`);
    const result = await getScraper(store.baseDomain).scrapeProduct(
      url,
      (store.scraperConfig ?? {}) as ScraperConfig
    );
    console.log(JSON.stringify(result, null, 2));
  } else if (storeId) {
    await runStoreScrape(storeId);
    console.log("انتهى سحب المتجر.");
  } else {
    await runAllStores();
    console.log("انتهى سحب كل المتاجر.");
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
