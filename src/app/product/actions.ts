"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db, productRatings } from "@/db";

// تقييم نجوم مجهول — صوت واحد لكل زائر لكل منتج، عبر كوكي sid (بدون تسجيل
// دخول ولا أي بيانات شخصية). التصويت مرة ثانية يحدّث نفس الصوت بدل تكراره.
export async function rateProductAction(formData: FormData) {
  const productId = Number(formData.get("product_id"));
  const rating = Number(formData.get("rating"));
  const slug = String(formData.get("slug") ?? "");
  if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5) return;

  const sessionId = (await cookies()).get("sid")?.value;
  if (!sessionId) return;

  await db
    .insert(productRatings)
    .values({ productId, rating, sessionId })
    .onConflictDoUpdate({
      target: [productRatings.productId, productRatings.sessionId],
      set: { rating },
    });

  if (slug) revalidatePath(`/product/${slug}`);
}
