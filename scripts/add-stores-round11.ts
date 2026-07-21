import { db, storeOffers } from "../src/db";

const NEW_OFFERS: { productId: number; storeId: number; productUrl: string }[] = [
  { productId: 41, storeId: 4, productUrl: "https://daralamirat.com.sa/en/vaseline---pink-lipstick-and-moisturizer,-20-grams/p607538867" },
  { productId: 41, storeId: 5, productUrl: "https://www.whites.sa/en-sa/vaseline-lip-therapy-rosy-lips/" },
  { productId: 57, storeId: 4, productUrl: "https://daralamirat.com.sa/en/global-star-sugar-sugar-for-the-face-and-body-in-pomegranate---600-g/p1412942363" },
  { productId: 75, storeId: 2, productUrl: "https://unitedpharmacy.sa/en/mielle-rosemary-strengthening-leave-in-conditioner-355-ml.html" },
  { productId: 75, storeId: 4, productUrl: "https://daralamirat.com.sa/en/mielle-rosemary-mint-strengthening-leave-in-conditioner-355ml/p181224299" },
];

(async () => {
  let added = 0;
  for (const o of NEW_OFFERS) {
    try {
      await db.insert(storeOffers).values(o);
      added++;
      console.log(`✓ منتج ${o.productId} → متجر ${o.storeId}`);
    } catch (e) {
      console.log(`✗ فشل منتج ${o.productId} → متجر ${o.storeId}: ${e instanceof Error ? e.message.slice(0, 80) : e}`);
    }
  }
  console.log(`\nإجمالي: ${added} عرض جديد أُضيف.`);
  process.exit(0);
})();
