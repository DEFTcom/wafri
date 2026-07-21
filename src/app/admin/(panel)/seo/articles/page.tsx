import { Collapsible } from "@/components/admin/Collapsible";
import { SeoSubNav } from "@/components/admin/SeoSubNav";
import { listArticles } from "@/lib/blog";
import { getArticleSeoMap } from "@/lib/seo";
import { upsertArticleSeoAction } from "../../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "سيو المقالات" };

const THIN_THRESHOLD = 3;

export default async function SeoArticlesPage() {
  const [articles, overrides] = await Promise.all([listArticles(), getArticleSeoMap()]);
  const thinCount = articles.filter((a) => a.productsCount < THIN_THRESHOLD).length;

  const inputCls =
    "w-full rounded-xl border border-teal-700/20 px-3 py-2.5 text-sm outline-none focus:border-rose-600 transition-colors";

  return (
    <div className="space-y-6">
      <div>
        <span className="text-teal-700 font-bold text-sm">📰 المدونة التلقائية</span>
        <h1 className="text-3xl mt-1">سيو المقالات</h1>
      </div>

      <SeoSubNav active="/admin/seo/articles" />

      <p className="text-sm text-ink/60 bg-white rounded-2xl p-4 border border-teal-700/10">
        المقالات هنا تتولد تلقائياً لكل فئة وماركة (بدون كتابة يدوية) وتتحدث
        مع الأسعار يومياً. تقدرين تخصّصي عنوان/وصف السيو لأي مقال، أو تستبعديها
        من نتائج البحث (noindex) — خصوصاً المقالات اللي فيها أقل من {THIN_THRESHOLD}{" "}
        منتجات (محتوى ضعيف قد يضر السيو العام للموقع).
      </p>

      {thinCount > 0 && (
        <p className="text-sm text-rose-600 font-semibold">
          ⚠️ {thinCount} مقال فيه أقل من {THIN_THRESHOLD} منتجات — فكري باستبعاده من البحث لحد ما يكبر.
        </p>
      )}

      <div className="space-y-3">
        {articles.map((a) => {
          const override = overrides.get(a.slug);
          const thin = a.productsCount < THIN_THRESHOLD;
          return (
            <Collapsible
              key={a.slug}
              icon={a.type === "category" ? "🗂️" : "🏷️"}
              title={a.title}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-ink/50">
                    {a.productsCount} منتج · {a.type === "category" ? "فئة" : "ماركة"}
                  </span>
                  {thin && (
                    <span className="rounded-full bg-gold-400/20 text-gold-400 px-2 py-0.5 font-bold">
                      محتوى ضعيف
                    </span>
                  )}
                  {override?.noindex && (
                    <span className="rounded-full bg-rose-600/10 text-rose-600 px-2 py-0.5 font-bold">
                      noindex
                    </span>
                  )}
                  <a
                    href={`/blog/${encodeURIComponent(a.slug)}`}
                    target="_blank"
                    className="text-teal-700 hover:underline ms-auto"
                  >
                    معاينة بالموقع
                  </a>
                </div>
                <form action={upsertArticleSeoAction} className="space-y-3">
                  <input type="hidden" name="slug" value={a.slug} />
                  <input
                    name="meta_title"
                    defaultValue={override?.metaTitle ?? ""}
                    placeholder={`عنوان سيو مخصص (تلقائياً: ${a.title})`}
                    className={inputCls}
                  />
                  <textarea
                    name="meta_description"
                    defaultValue={override?.metaDescription ?? ""}
                    placeholder="وصف سيو مخصص — اتركيه فارغاً لاستخدام الوصف التلقائي"
                    rows={2}
                    className={`${inputCls} resize-none`}
                  />
                  <textarea
                    name="intro_override"
                    defaultValue={override?.introOverride ?? ""}
                    placeholder="فقرة مقدمة مخصصة تظهر أعلى المقال (اختياري — تحل محل النص التلقائي)"
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                  <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none w-fit">
                    <input
                      type="checkbox"
                      name="noindex"
                      defaultChecked={override?.noindex ?? false}
                      className="accent-rose-600"
                    />
                    استبعاد من نتائج البحث (noindex)
                  </label>
                  <button className="rounded-xl bg-rose-600 text-white px-6 py-2 text-sm font-semibold hover:brightness-110 transition-all">
                    حفظ
                  </button>
                </form>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
