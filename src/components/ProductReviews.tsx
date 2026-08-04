const RELATIVE = new Intl.RelativeTimeFormat("ar", { numeric: "auto" });

function relativeDate(date: Date) {
  const days = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days === 0) return "اليوم";
  if (days > -30) return RELATIVE.format(days, "day");
  const months = Math.round(days / 30);
  return RELATIVE.format(months, "month");
}

export function ProductReviews({
  reviews,
}: {
  reviews: { rating: number; comment: string | null; createdAt: Date }[];
}) {
  if (reviews.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-bold text-teal-900">
        آراء الزائرات ({reviews.length})
      </h2>
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-2xl bg-white border border-teal-700/10 p-4">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-gold-400 text-sm" dir="ltr">
                {"★".repeat(r.rating)}
                <span className="text-ink/20">{"★".repeat(5 - r.rating)}</span>
              </div>
              <span className="text-xs text-ink/40">{relativeDate(r.createdAt)}</span>
            </div>
            <p className="text-sm text-ink/80 leading-6">{r.comment}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
