import { and, eq } from "drizzle-orm";
import { db, storeOffers, products } from "../src/db";

(async () => {
  // 1) إصلاح رابط النهدي لقناع ميلي (كان بدون /pdp/رقم)
  await db
    .update(storeOffers)
    .set({
      productUrl:
        "https://www.nahdionline.com/en-sa/mielle-organics-rosemary-mint-strengthening-hair-mask-340-gm/pdp/102847595",
    })
    .where(and(eq(storeOffers.productId, 17), eq(storeOffers.storeId, 1)));

  // 2) حذف عرض دار الأميرات لجيجون (رابط غير صالح) — يبقى نايس ون فقط
  await db
    .delete(storeOffers)
    .where(and(eq(storeOffers.productId, 46), eq(storeOffers.storeId, 4)));

  // 3) حذف منتج سيفيزا الليفة الكورية بالكامل — الرابط الوحيد (نايس ون) غير صالح
  //    بمتغيرين (وردي وأزرق)، أي المنتج بدون أي متجر شغال
  await db.delete(storeOffers).where(eq(storeOffers.productId, 61));
  await db.delete(products).where(eq(products.id, 61));

  console.log("تم تطبيق الإصلاحات الثلاثة");
  process.exit(0);
})();
