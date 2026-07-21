import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db, matchQueue, storeOffers, stores } from "@/db";
import { StoreLogo } from "@/components/StoreLogo";
import { reviewMatchAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "مراجعة المطابقات" };

export default async function MatchesPage() {
  const offerA = alias(storeOffers, "offer_a");
  const offerB = alias(storeOffers, "offer_b");
  const storeA = alias(stores, "store_a");
  const storeB = alias(stores, "store_b");

  const pending = await db
    .select({
      id: matchQueue.id,
      confidence: matchQueue.confidenceScore,
      titleA: offerA.rawTitle,
      titleB: offerB.rawTitle,
      urlA: offerA.productUrl,
      urlB: offerB.productUrl,
      storeAName: storeA.nameAr,
      storeALogo: storeA.logoUrl,
      storeBName: storeB.nameAr,
      storeBLogo: storeB.logoUrl,
    })
    .from(matchQueue)
    .innerJoin(offerA, eq(offerA.id, matchQueue.candidateAOfferId))
    .innerJoin(offerB, eq(offerB.id, matchQueue.candidateBOfferId))
    .innerJoin(storeA, eq(storeA.id, offerA.storeId))
    .innerJoin(storeB, eq(storeB.id, offerB.storeId))
    .where(eq(matchQueue.status, "pending"));

  return (
    <div className="space-y-6">
      <div>
        <span className="text-teal-700 font-bold text-sm">🔗 مطابقة ذكية</span>
        <h1 className="text-3xl mt-1">مطابقات بانتظار المراجعة ({pending.length})</h1>
      </div>
      {pending.length === 0 && (
        <div className="rounded-3xl bg-white border border-teal-700/10 p-10 text-center">
          <span className="text-4xl block mb-3" aria-hidden>🎉</span>
          <p className="text-ink/60">لا توجد مطابقات معلقة.</p>
        </div>
      )}
      <div className="space-y-4">
        {pending.map((m) => (
          <div key={m.id} className="card-hover rounded-3xl bg-white border border-teal-700/10 p-5">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {[
                { store: m.storeAName, logo: m.storeALogo, title: m.titleA, url: m.urlA },
                { store: m.storeBName, logo: m.storeBLogo, title: m.titleB, url: m.urlB },
              ].map((side, i) => (
                <div key={i} className="rounded-2xl bg-cream p-4 flex gap-3">
                  <StoreLogo src={side.logo} name={side.store} size="sm" />
                  <div className="min-w-0">
                    <span className="text-xs text-teal-700 font-bold">{side.store}</span>
                    <p className="text-sm mt-1">{side.title}</p>
                    <a
                      href={side.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-rose-600 underline"
                    >
                      فتح بالمتجر ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink/60">
                الثقة:{" "}
                <b
                  className={
                    Number(m.confidence ?? 0) >= 70 ? "text-save-600" : "text-gold-400"
                  }
                >
                  {m.confidence ? `${Number(m.confidence).toFixed(0)}٪` : "—"}
                </b>
              </span>
              <form action={reviewMatchAction} className="ms-auto flex gap-2">
                <input type="hidden" name="id" value={m.id} />
                <button
                  name="decision"
                  value="approve"
                  className="rounded-xl bg-save-600 text-white px-5 py-2 text-sm font-semibold hover:brightness-110 transition-all"
                >
                  نفس المنتج — ادمج
                </button>
                <button
                  name="decision"
                  value="reject"
                  className="rounded-xl bg-rose-600/10 text-rose-600 px-5 py-2 text-sm font-semibold hover:bg-rose-600/20 transition-colors"
                >
                  مختلفان
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
