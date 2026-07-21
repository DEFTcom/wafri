import { and, eq, inArray, ne, or } from "drizzle-orm";
import { db, matchQueue, products, storeOffers } from "../db";
import { rankCandidates } from "./candidates";
import { verifyMatch } from "./verify";

// دمج منتجين تأكد تطابقهما: تنتقل عروض المكرر للمنتج الأساسي ويُحذف المكرر.
export async function mergeProducts(
  keepProductId: number,
  duplicateProductId: number
): Promise<void> {
  await db
    .update(storeOffers)
    .set({ productId: keepProductId })
    .where(eq(storeOffers.productId, duplicateProductId));
  await db.delete(products).where(eq(products.id, duplicateProductId));
}

type OfferRow = {
  offerId: number;
  productId: number;
  storeId: number;
  title: string;
};

// §٤ — المسار الكامل: ترشيح نصي ثم تحقق Claude ثم ربط تلقائي أو قائمة مراجعة.
export async function runMatching(): Promise<{
  merged: number;
  queued: number;
}> {
  const rows: OfferRow[] = (
    await db
      .select({
        offerId: storeOffers.id,
        productId: storeOffers.productId,
        storeId: storeOffers.storeId,
        rawTitle: storeOffers.rawTitle,
      })
      .from(storeOffers)
  ).map((r) => ({ ...r, title: r.rawTitle }));

  let merged = 0;
  let queued = 0;
  const consumed = new Set<number>(); // منتجات دُمجت خلال هذه التشغيلة

  for (const offer of rows) {
    if (consumed.has(offer.productId) || !offer.title) continue;

    // المرشحون: عروض منتجات أخرى من متاجر مختلفة
    const pool = rows.filter(
      (r) =>
        r.productId !== offer.productId &&
        r.storeId !== offer.storeId &&
        !consumed.has(r.productId) &&
        r.title
    );
    const candidates = rankCandidates(
      offer.title,
      pool.map((p) => ({ title: p.title, item: p }))
    );

    for (const cand of candidates.slice(0, 3)) {
      const other = cand.item;

      const existing = await db
        .select({ id: matchQueue.id })
        .from(matchQueue)
        .where(
          or(
            and(
              eq(matchQueue.candidateAOfferId, offer.offerId),
              eq(matchQueue.candidateBOfferId, other.offerId)
            ),
            and(
              eq(matchQueue.candidateAOfferId, other.offerId),
              eq(matchQueue.candidateBOfferId, offer.offerId)
            )
          )
        );
      if (existing.length) continue;

      const verdict = await verifyMatch(offer.title, other.title);

      if (verdict && verdict.isMatch && verdict.confidence >= 90) {
        await mergeProducts(offer.productId, other.productId);
        consumed.add(other.productId);
        merged++;
        console.log(
          `ربط تلقائي (${verdict.confidence}%): "${offer.title}" ↔ "${other.title}"`
        );
        break; // المنتج ارتبط — ننتقل للعرض التالي
      }

      // بدون مفتاح API نعتمد التشابه النصي، ومع المفتاح نعتمد ثقة Claude
      const confidence = verdict
        ? verdict.confidence
        : Math.round(cand.score * 100);
      // بدون مفتاح: أي مرشح تجاوز ترشيح التشابه يستحق مراجعة بشرية
      const worthReview = verdict ? verdict.confidence >= 40 : true;
      if (worthReview) {
        await db.insert(matchQueue).values({
          candidateAOfferId: offer.offerId,
          candidateBOfferId: other.offerId,
          confidenceScore: String(confidence),
        });
        queued++;
      }
    }
  }

  return { merged, queued };
}
