import { desc, eq, sql } from "drizzle-orm";
import { AnalyticsTrendChart } from "@/components/admin/AnalyticsTrendChart";
import { AnimatedBarList } from "@/components/admin/AnimatedBarList";
import { clickLogs, db, searchLogs, storeOffers, stores } from "@/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "التحليلات" };

const TREND_DAYS = 14;

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: string;
  label: string;
  value: number;
  tone: "rose" | "teal" | "gold";
}) {
  const toneCls = {
    rose: "bg-rose-600/10 text-rose-600",
    teal: "bg-teal-700/10 text-teal-700",
    gold: "bg-gold-400/20 text-gold-400",
  }[tone];
  return (
    <div className="card-hover rounded-3xl bg-white border border-teal-700/10 p-5 flex items-center gap-4">
      <span className={`w-12 h-12 rounded-2xl grid place-items-center text-2xl shrink-0 ${toneCls}`} aria-hidden>
        {icon}
      </span>
      <div>
        <p className="text-2xl font-bold text-ink">{value.toLocaleString("ar-SA")}</p>
        <p className="text-xs text-ink/50">{label}</p>
      </div>
    </div>
  );
}

function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default async function AnalyticsPage() {
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - (TREND_DAYS - 1));
  sinceDate.setHours(0, 0, 0, 0);
  const since = sinceDate.toISOString();

  const [topSearches, zeroResults, topClicks, dailySearchRows, dailyClickRows, searchCount, zeroCount, clickCount, sessionCount] =
    await Promise.all([
    db
      .select({ query: searchLogs.queryText, count: sql<number>`count(*)::int` })
      .from(searchLogs)
      .groupBy(searchLogs.queryText)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
    db
      .select({ query: searchLogs.queryText, count: sql<number>`count(*)::int` })
      .from(searchLogs)
      .where(eq(searchLogs.resultsCount, 0))
      .groupBy(searchLogs.queryText)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
    db
      .select({ title: storeOffers.rawTitle, storeName: stores.nameAr, count: sql<number>`count(*)::int` })
      .from(clickLogs)
      .innerJoin(storeOffers, eq(storeOffers.id, clickLogs.storeOfferId))
      .innerJoin(stores, eq(stores.id, storeOffers.storeId))
      .groupBy(storeOffers.id, stores.nameAr)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
    db
      .select({ day: sql<string>`to_char(${searchLogs.searchedAt}, 'YYYY-MM-DD')`, count: sql<number>`count(*)::int` })
      .from(searchLogs)
      .where(sql`${searchLogs.searchedAt} >= ${since}`)
      .groupBy(sql`to_char(${searchLogs.searchedAt}, 'YYYY-MM-DD')`),
    db
      .select({ day: sql<string>`to_char(${clickLogs.clickedAt}, 'YYYY-MM-DD')`, count: sql<number>`count(*)::int` })
      .from(clickLogs)
      .where(sql`${clickLogs.clickedAt} >= ${since}`)
      .groupBy(sql`to_char(${clickLogs.clickedAt}, 'YYYY-MM-DD')`),
    db.select({ count: sql<number>`count(*)::int` }).from(searchLogs),
    db.select({ count: sql<number>`count(*)::int` }).from(searchLogs).where(eq(searchLogs.resultsCount, 0)),
    db.select({ count: sql<number>`count(*)::int` }).from(clickLogs),
    db.select({ count: sql<number>`count(distinct ${searchLogs.sessionId})::int` }).from(searchLogs),
  ]);

  const days = lastNDays(TREND_DAYS);
  const searchByDay = new Map(dailySearchRows.map((r) => [r.day, r.count]));
  const clickByDay = new Map(dailyClickRows.map((r) => [r.day, r.count]));
  const dayLabels = days.map((d) => `${d.slice(5, 7)}/${d.slice(8, 10)}`);
  const totalsRow = {
    searches: searchCount[0]?.count ?? 0,
    zeroResults: zeroCount[0]?.count ?? 0,
    clicks: clickCount[0]?.count ?? 0,
    sessions: sessionCount[0]?.count ?? 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <span className="text-teal-700 font-bold text-sm">📊 نبض الزوار</span>
        <h1 className="text-3xl mt-1">التحليلات</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🔍" label="إجمالي عمليات البحث" value={totalsRow.searches} tone="teal" />
        <StatCard icon="🕳️" label="بحث بدون نتائج" value={totalsRow.zeroResults} tone="gold" />
        <StatCard icon="👆" label="نقرات لمتاجر خارجية" value={totalsRow.clicks} tone="rose" />
        <StatCard icon="👥" label="زوار قاموا بالبحث" value={totalsRow.sessions} tone="teal" />
      </div>

      <section className="card-hover rounded-3xl bg-white border border-teal-700/10 p-5">
        <h2 className="text-lg mb-3 flex items-center gap-2">
          <span aria-hidden>📈</span> نشاط آخر {TREND_DAYS} يوم
        </h2>
        <AnalyticsTrendChart
          days={dayLabels}
          series={[
            { label: "عمليات بحث", color: "#1D4E4A", values: days.map((d) => searchByDay.get(d) ?? 0) },
            { label: "نقرات شراء", color: "#D6455C", values: days.map((d) => clickByDay.get(d) ?? 0) },
          ]}
        />
      </section>

      <div className="grid lg:grid-cols-3 gap-4">
        <AnimatedBarList
          icon="🔥"
          title="الأكثر بحثاً"
          barGradient={1}
          rows={topSearches.map((r) => ({ label: r.query, count: r.count }))}
        />
        <AnimatedBarList
          icon="🕳️"
          title="بحث بدون نتائج (فرص إضافة)"
          barGradient={2}
          rows={zeroResults.map((r) => ({ label: r.query, count: r.count }))}
        />
        <AnimatedBarList
          icon="👆"
          title="الأكثر نقراً لمتجر خارجي"
          barGradient={0}
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
