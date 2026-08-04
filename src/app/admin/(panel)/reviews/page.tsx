import { desc, eq, isNotNull } from "drizzle-orm";
import { db, productRatings, products } from "@/db";
import { reviewCommentAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "مراجعة التقييمات" };

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  pending: { label: "بانتظار المراجعة", cls: "bg-gold-400/20 text-gold-400" },
  approved: { label: "منشور", cls: "bg-save-600/10 text-save-600" },
  rejected: { label: "مرفوض", cls: "bg-rose-600/10 text-rose-600" },
};

export default async function ReviewsPage() {
  const rows = await db
    .select({
      id: productRatings.id,
      rating: productRatings.rating,
      comment: productRatings.comment,
      status: productRatings.commentStatus,
      createdAt: productRatings.createdAt,
      productId: products.id,
      productName: products.nameAr,
      productSlug: products.slug,
    })
    .from(productRatings)
    .innerJoin(products, eq(products.id, productRatings.productId))
    .where(isNotNull(productRatings.comment))
    .orderBy(desc(productRatings.createdAt));

  const pending = rows.filter((r) => r.status === "pending");
  const rest = rows.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <span className="text-teal-700 font-bold text-sm">💬 تعليقات الزوار</span>
        <h1 className="text-3xl mt-1">مراجعة التقييمات</h1>
      </div>

      {rows.length === 0 && (
        <div className="rounded-3xl bg-white border border-teal-700/10 p-10 text-center">
          <span className="text-4xl block mb-3" aria-hidden>💬</span>
          <p className="text-ink/60">ما فيه أي تعليقات كتابية لسه.</p>
        </div>
      )}

      {[...pending, ...rest].map((r) => {
        const status = STATUS_STYLE[r.status ?? "pending"];
        return (
          <div
            key={r.id}
            className="card-hover rounded-3xl bg-white border border-teal-700/10 p-5 space-y-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <a
                href={`/product/${r.productSlug ?? r.productId}`}
                target="_blank"
                className="font-semibold text-teal-700 hover:underline"
              >
                {r.productName} ↗
              </a>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${status.cls}`}>
                {status.label}
              </span>
            </div>
            <div className="text-gold-400 text-sm" dir="ltr">
              {"★".repeat(r.rating)}
              <span className="text-ink/20">{"★".repeat(5 - r.rating)}</span>
            </div>
            <p className="text-sm text-ink/80 leading-6 bg-cream rounded-xl p-3">{r.comment}</p>
            <form action={reviewCommentAction} className="flex gap-2">
              <input type="hidden" name="id" value={r.id} />
              {r.status !== "approved" && (
                <button
                  name="decision"
                  value="approve"
                  className="rounded-xl bg-save-600 text-white px-5 py-2 text-sm font-semibold hover:brightness-110 transition-all"
                >
                  ✓ نشر
                </button>
              )}
              {r.status !== "rejected" && (
                <button
                  name="decision"
                  value="reject"
                  className="rounded-xl bg-gold-400/20 text-gold-400 px-5 py-2 text-sm font-semibold hover:bg-gold-400/30 transition-colors"
                >
                  إخفاء
                </button>
              )}
              <button
                name="decision"
                value="delete"
                className="rounded-xl bg-rose-600/10 text-rose-600 px-5 py-2 text-sm font-semibold hover:bg-rose-600/20 transition-colors"
              >
                🗑 حذف التعليق
              </button>
            </form>
          </div>
        );
      })}
    </div>
  );
}
