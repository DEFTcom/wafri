import { desc, eq, sql } from "drizzle-orm";
import { clickLogs, db, searchLogs, storeOffers, stores } from "@/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "التحليلات" };

function Card({
  icon,
  title,
  rows,
}: {
  icon: string;
  title: string;
  rows: { label: string; sub?: string; count: number }[];
}) {
  return (
    <section className="card-hover rounded-3xl bg-white border border-teal-700/10 p-5">
      <h2 className="text-lg mb-3 flex items-center gap-2">
        <span aria-hidden>{icon}</span> {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ink/50">لا بيانات بعد.</p>
      ) : (
        <ol className="space-y-2 text-sm">
          {rows.map((r, i) => (
            <li key={i} className="flex gap-2 items-center">
              <span className="w-5 h-5 rounded-full bg-teal-700/10 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="flex-1 line-clamp-1">
                {r.label}
                {r.sub && <span className="text-ink/50 text-xs"> — {r.sub}</span>}
              </span>
              <b className="text-rose-600">{r.count}</b>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default async function AnalyticsPage() {
  const topSearches = await db
    .select({
      query: searchLogs.queryText,
      count: sql<number>`count(*)::int`,
    })
    .from(searchLogs)
    .groupBy(searchLogs.queryText)
    .orderBy(desc(sql`count(*)`))
    .limit(15);

  const zeroResults = await db
    .select({
      query: searchLogs.queryText,
      count: sql<number>`count(*)::int`,
    })
    .from(searchLogs)
    .where(eq(searchLogs.resultsCount, 0))
    .groupBy(searchLogs.queryText)
    .orderBy(desc(sql`count(*)`))
    .limit(15);

  const topClicks = await db
    .select({
      title: storeOffers.rawTitle,
      storeName: stores.nameAr,
      count: sql<number>`count(*)::int`,
    })
    .from(clickLogs)
    .innerJoin(storeOffers, eq(storeOffers.id, clickLogs.storeOfferId))
    .innerJoin(stores, eq(stores.id, storeOffers.storeId))
    .groupBy(storeOffers.id, stores.nameAr)
    .orderBy(desc(sql`count(*)`))
    .limit(15);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-teal-700 font-bold text-sm">📊 نبض الزوار</span>
        <h1 className="text-3xl mt-1">التحليلات</h1>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card
          icon="🔥"
          title="الأكثر بحثاً"
          rows={topSearches.map((r) => ({ label: r.query, count: r.count }))}
        />
        <Card
          icon="🕳️"
          title="بحث بدون نتائج (فرص إضافة)"
          rows={zeroResults.map((r) => ({ label: r.query, count: r.count }))}
        />
        <Card
          icon="👆"
          title="الأكثر نقراً لمتجر خارجي"
          rows={topClicks.map((r) => ({
            label: r.title || "(بدون عنوان)",
            sub: r.storeName,
            count: r.count,
          }))}
        />
      </div>
    </div>
  );
}
