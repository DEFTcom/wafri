import { runDiscovery } from "../src/scrapers/discover";

runDiscovery()
  .then((added) => {
    console.log(`انتهى الاكتشاف: ${added} منتج جديد بانتظار المراجعة.`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
