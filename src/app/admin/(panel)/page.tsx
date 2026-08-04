import { and, desc, eq, sql } from "drizzle-orm";
import Link from "next/link";
import { db, products, scrapeRuns, storeOffers, stores } from "@/db";
import { StoreLogo } from "@/components/StoreLogo";
import { retryOfferScrapeAction, runSchemaSyncAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "حالة السحب" };

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  success: { label: "ناجح", cls: "bg-save-600/10 text-save-600" },
  partial: { label: "جزئي", cls: "bg-gold-400/20 text-gold-400" },
  failed: { label: "فاشل", cls: "bg-rose-600/10 text-rose-600" },
};

export default async function AdminDashboard() {
  const allStores = await db.select().from(stores);

  const rows = await Promise.all(
    allStores.map(async (store) => {
      const [lastRun] = await db
        .select()
        .from(scrapeRuns)
        .where(eq(scrapeRuns.storeId, store.id))
        .orderBy(desc(scrapeRuns.startedAt))
        .limit(1);
      const [counts] = await db
        .select({
          offers: sql<number>`count(*)::int`,
          failing: sql<number>`count(*) filter (where ${storeOffers.lastScrapeStatus} = 'failed')::int`,
        })
        .from(storeOffers)
        .where(eq(storeOffers.storeId, store.id));
      // العروض الفاشلة الفعلية بأسماء منتجاتها — مو نص خام، عشان يصير فيه فعل حقيقي
      const failingOffers = await db
        .select({
          id: storeOffers.id,
          productId: storeOffers.productId,
          productName: products.nameAr,
          productSlug: products.slug,
          error: storeOffers.lastScrapeError,
        })
        .from(storeOffers)
        .innerJoin(products, eq(products.id, storeOffers.productId))
        .where(
          and(eq(storeOffers.storeId, store.id), eq(storeOffers.lastScrapeStatus, "failed"))
        )
        .limit(20);
      return { store, lastRun, counts, failingOffers };
    })
  );

  const problems = rows.filter(
    ({ store, lastRun, counts }) =>
      store.isActive &&
      ((lastRun && lastRun.status !== "success") || counts.failing > 0)
  );

  return (
    <div className="space-y-6">
      <div>
        <span className="text-teal-700 font-bold text-sm">📡 مراقبة يومية</span>
        <h1 className="text-3xl mt-1">حالة السحب اليومي</h1>
      </div>

      {/* مؤقت — يضيف عمودي التعليق الكتابي بقاعدة الإنتاج، يُحذف بعد أول ضغطة */}
      <form action={runSchemaSyncAction}>
        <button className="rounded-xl bg-gold-400 text-ink px-5 py-2.5 text-sm font-semibold hover:brightness-95 transition-all">
          🛠️ مزامنة قاعدة البيانات (تعليقات التقييم)
        </button>
      </form>

      {/* تنبيه بارز عند وجود أي فشل بالسحب */}
      {problems.length > 0 && (
        <div className="rounded-2xl bg-rose-600 text-white p-5 flex items-start gap-3">
          <span className="text-2xl float-soft" aria-hidden>⚠️</span>
          <div>
            <b className="block mb-1">انتبهي — يوجد فشل بالسحب</b>
            <p className="text-white/90 text-sm">
              {problems.map((p) => p.store.nameAr).join("، ")} — راجعي تفاصيل
              الأخطاء بالبطاقات أدناه. المنتجات الفاشلة تعرض آخر سعر معروف
              للزوار.
            </p>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map(({ store, lastRun, counts, failingOffers }) => {
          const status = lastRun?.status
            ? STATUS_STYLE[lastRun.status]
            : lastRun
              ? { label: "غير مكتمل", cls: "bg-ink/10 text-ink/60" }
              : null;
          return (
            <div
              key={store.id}
              className="card-hover rounded-3xl bg-white border border-teal-700/10 p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <StoreLogo src={store.logoUrl} name={store.nameAr} />
                <div className="min-w-0">
                  <h2 className="font-bold leading-6">
                    {store.nameAr}
                    {!store.isActive && (
                      <span className="text-xs text-ink/40"> (موقوف)</span>
                    )}
                  </h2>
                  <p className="text-xs text-ink/50 truncate" dir="ltr">
                    {store.baseDomain}
                  </p>
                </div>
                {status && (
                  <span className={`ms-auto shrink-0 rounded-full px-3 py-1 text-xs font-bold ${status.cls}`}>
                    {status.label}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-cream p-3">
                  <span className="text-ink/50 text-xs block">نجح/حاول</span>
                  <span className="font-bold text-teal-700">
                    {lastRun ? `${lastRun.productsSuccess}/${lastRun.productsAttempted}` : "—"}
                  </span>
                </div>
                <div className="rounded-xl bg-cream p-3">
                  <span className="text-ink/50 text-xs block">عروض فاشلة</span>
                  <span className={`font-bold ${counts.failing > 0 ? "text-rose-600" : "text-teal-700"}`}>
                    {counts.failing} <span className="text-ink/40 font-normal">من {counts.offers}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-ink/50" dir="ltr">
                {lastRun?.startedAt
                  ? new Date(lastRun.startedAt).toLocaleString("ar-SA")
                  : "لم يُشغل بعد"}
              </p>

              {failingOffers.length > 0 && (
                <div className="text-xs space-y-2 pt-1 border-t border-rose-600/10">
                  <p className="text-rose-600 font-bold pt-2">⚠️ عروض فاشلة ({counts.failing}) — لازم فعل:</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {failingOffers.map((o) => (
                      <div key={o.id} className="rounded-xl bg-rose-100 p-2.5 space-y-1">
                        <p className="font-semibold text-ink line-clamp-1">{o.productName}</p>
                        {o.error && <p className="text-rose-600 line-clamp-2">{o.error}</p>}
                        <div className="flex items-center gap-3 pt-0.5">
                          <Link
                            href={`/admin/products/${o.productId}/edit`}
                            className="text-teal-700 font-semibold hover:underline"
                          >
                            تعديل المنتج
                          </Link>
                          <form action={retryOfferScrapeAction}>
                            <input type="hidden" name="offer_id" value={o.id} />
                            <button className="text-teal-700 font-semibold hover:underline">
                              🔄 إعادة المحاولة
                            </button>
                          </form>
                        </div>
                      </div>
                    ))}
                    {counts.failing > failingOffers.length && (
                      <p className="text-ink/50 text-center">
                        و{counts.failing - failingOffers.length} عرض فاشل آخر — افتحي صفحة المنتجات وابحثي فيها
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-sm text-ink/50">
        السحب مجدول تلقائياً يومياً (Vercel Cron)، والاكتشاف والمطابقة أسبوعياً. تشغيل يدوي محلي:{" "}
        <code dir="ltr" className="bg-white rounded px-1.5 py-0.5">npm run scrape</code>،{" "}
        <code dir="ltr" className="bg-white rounded px-1.5 py-0.5">npm run discover</code>،{" "}
        <code dir="ltr" className="bg-white rounded px-1.5 py-0.5">npm run match</code>.
      </p>
    </div>
  );
}
