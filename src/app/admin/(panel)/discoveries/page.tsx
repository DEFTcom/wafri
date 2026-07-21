import { eq } from "drizzle-orm";
import { SafeImage } from "@/components/SafeImage";
import { categories, db, discoveryQueue, stores } from "@/db";
import { Price } from "@/components/Riyal";
import { StoreLogo } from "@/components/StoreLogo";
import { reviewDiscoveryAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "مراجعة الاكتشافات" };

const CATEGORY_ICONS: Record<string, string> = {
  skincare: "🧴",
  "hair-care": "💇‍♀️",
  "body-care": "🧖‍♀️",
  "oral-care": "🦷",
  "lip-care": "💋",
  "eye-care": "👁️",
  "hand-care": "💅",
  "foot-care": "🦶",
  "women-care": "🌸",
  "men-care": "🪒",
  "baby-care": "👶",
};

export default async function DiscoveriesPage() {
  const [pending, allCategories] = await Promise.all([
    db
      .select({
        id: discoveryQueue.id,
        title: discoveryQueue.rawTitle,
        url: discoveryQueue.productUrl,
        price: discoveryQueue.price,
        imageUrl: discoveryQueue.imageUrl,
        source: discoveryQueue.discoverySource,
        storeName: stores.nameAr,
        storeLogo: stores.logoUrl,
      })
      .from(discoveryQueue)
      .innerJoin(stores, eq(stores.id, discoveryQueue.storeId))
      .where(eq(discoveryQueue.status, "pending")),
    db.select().from(categories),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <span className="text-teal-700 font-bold text-sm">🔎 زحف هجين</span>
        <h1 className="text-3xl mt-1">منتجات مكتشفة بانتظار الموافقة ({pending.length})</h1>
      </div>
      {pending.length === 0 && (
        <div className="rounded-3xl bg-white border border-teal-700/10 p-10 text-center">
          <span className="text-4xl block mb-3" aria-hidden>📭</span>
          <p className="text-ink/60">
            لا اكتشافات معلقة — شغّلي{" "}
            <code dir="ltr" className="bg-cream rounded px-1.5 py-0.5">npm run discover</code>{" "}
            لجلب الأشهر من المتاجر.
          </p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {pending.map((d) => (
          <div key={d.id} className="card-hover rounded-3xl bg-white border border-teal-700/10 p-4 flex gap-4">
            <div className="relative w-20 h-20 shrink-0 rounded-xl bg-cream overflow-hidden">
              {d.imageUrl && (
                <SafeImage src={d.imageUrl} alt={d.title} fill sizes="5rem" className="object-contain" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-xs text-teal-700 font-bold">
                <StoreLogo src={d.storeLogo} name={d.storeName} size="sm" />
                {d.storeName}
              </span>
              <p className="text-sm line-clamp-2 mt-1">{d.title}</p>
              <div className="text-sm text-ink/60 flex items-center gap-2">
                {d.price && <Price value={d.price} />}
                <a href={d.url} target="_blank" rel="noreferrer" className="text-rose-600 underline text-xs">
                  المصدر ↗
                </a>
              </div>
              <form action={reviewDiscoveryAction} className="flex flex-wrap gap-2 mt-2">
                <input type="hidden" name="id" value={d.id} />
                <select
                  name="category_id"
                  defaultValue={allCategories[0]?.id}
                  className="rounded-lg border border-teal-700/20 px-2 py-1.5 text-xs outline-none focus:border-rose-600"
                >
                  {allCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {CATEGORY_ICONS[c.slug] ?? "✨"} {c.nameAr}
                    </option>
                  ))}
                </select>
                <button name="decision" value="approve" className="rounded-lg bg-save-600 text-white px-4 py-1.5 text-xs font-semibold hover:brightness-110 transition-all">
                  إضافة
                </button>
                <button name="decision" value="reject" className="rounded-lg bg-rose-600/10 text-rose-600 px-4 py-1.5 text-xs font-semibold hover:bg-rose-600/20 transition-colors">
                  تجاهل
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
