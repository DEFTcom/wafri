"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db, productRatings } from "@/db";

// تقييم نجوم مجهول — صوت واحد لكل زائر لكل منتج، عبر كوكي sid (بدون تسجيل
// دخول ولا أي بيانات شخصية). التصويت مرة ثانية يحدّث نفس الصوت بدل تكراره.
// التعليق الكتابي اختياري ويبقى مخفياً عن الزوار (comment_status = pending)
// لحين ما تراجعه الإدارة من لوحة التقييمات وتوافق عليه.
export async function rateProductAction(formData: FormData) {
  const productId = Number(formData.get("product_id"));
  const rating = Number(formData.get("rating"));
  const slug = String(formData.get("slug") ?? "");
  const comment = String(formData.get("comment") ?? "").trim() || null;
  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5) return;

  const sessionId = (await cookies()).get("sid")?.value;
  if (!sessionId) return;

  await db
    .insert(productRatings)
    .values({
      productId,
      rating,
      sessionId,
      ...(comment && { comment, commentStatus: "pending" }),
    })
    .onConflictDoUpdate({
      target: [productRatings.productId, productRatings.sessionId],
      // ما نلمس تعليق سابق موافَق عليه لو هالتصويت الجديد بدون تعليق —
      // فقط نحدّث التعليق لو المستخدمة كتبت وحدة جديدة فعلاً
      set: { rating, ...(comment && { comment, commentStatus: "pending" }) },
    });

  if (slug) revalidatePath(`/product/${slug}`);
}
