import { and, eq } from "drizzle-orm";
import { db, storeOffers } from "../src/db";

(async () => {
  // 1) إصلاح رابط دار الأميرات لفيم فريش (الرابط القديم أُلغي — 410)
  await db
    .update(storeOffers)
    .set({
      productUrl:
        "https://daralamirat.com.sa/en/feh-fresh-asbray-is-a-refreshing-foolish-areas-of-intimate-areas---125-ml/p1690847030",
    })
    .where(and(eq(storeOffers.productId, 93), eq(storeOffers.storeId, 4)));

  // 2) حذف عرض المتحدة لكوسركس — الرابط المخمَّن غير صحيح ولا يوجد بديل مؤكد،
  //    والمنتج يبقى بعرضين شغالين (النهدي + نايس ون)
  await db
    .delete(storeOffers)
    .where(and(eq(storeOffers.productId, 97), eq(storeOffers.storeId, 2)));

  console.log("تم تطبيق الإصلاحين");
  process.exit(0);
})();
