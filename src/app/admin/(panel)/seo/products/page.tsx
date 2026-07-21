import { eq, ilike, or, sql } from "drizzle-orm";
import Link from "next/link";
import { db, products, storeOffers } from "@/db";
import { SeoSubNav } from "@/components/admin/SeoSubNav";

export const dynamic = "force-dynamic";
export const metadata = { title: "سيو المنتجات" };

export default async function SeoProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const { q, filter } = await searchParams;
  const query = (q ?? "").trim();

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      nameAr: products.nameAr,
      brand: products.brand,
      imageUrl: products.imageUrl,
      metaTitle: products.metaTitle,
      metaDescription: products.metaDescription,
      noindex: products.noindex,
      offersCount: sql<number>`count(${storeOffers.id})::int`,
    })
    .from(products)
    .leftJoin(storeOffers, eq(storeOffers.productId, products.id))
    .where(
      query
        ? or(ilike(products.nameAr, `%${query}%`), ilike(products.brand, `%${query}%`))
        : undefined
    )
    .groupBy(products.id)
    .orderBy(products.id);

  const withFlags = rows.map((p) => ({
    ...p,
    thin: p.offersCount <= 1,
    hasCustomTitle: !!p.metaTitle?.trim(),
    hasCustomDescription: !!p.metaDescription?.trim(),
    missingImage: !p.imageUrl,
  }));

  const filtered =
    filter === "problems"
      ? withFlags.filter((p) => p.thin || p.missingImage || p.noindex)
      : withFlags;

  const problemsCount = withFlags.filter((p) => p.thin || p.missingImage).length;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-teal-700 font-bold text-sm">🧴 صحة السيو</span>
        <h1 className="text-3xl mt-1">سيو المنتجات</h1>
      </div>

      <SeoSubNav active="/admin/seo/products" />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <form className="flex gap-2 flex-1 max-w-sm min-w-[12rem]">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="ابحثي بالاسم أو الماركة…"
            className="w-full rounded-xl border border-teal-700/20 px-4 py-2 text-sm outline-none focus:border-rose-600 transition-colors"
          />
          <button className="rounded-xl bg-teal-700/10 text-teal-700 px-4 py-2 text-sm font-semibold hover:bg-teal-700/20 transition-colors">
            بحث
          </button>
        </form>
        <div className="flex gap-2">
          <Link
            href="/admin/seo/products"
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${!filter ? "bg-teal-700 text-white" : "bg-white border border-teal-700/10 text-teal-700"}`}
          >
            الكل ({withFlags.length})
          </Link>
          <Link
            href="/admin/seo/products?filter=problems"
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${filter === "problems" ? "bg-rose-600 text-white" : "bg-white border border-teal-700/10 text-rose-600"}`}
          >
            ⚠️ فيها مشاكل ({problemsCount})
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-teal-700/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-teal-700/5">
            <tr>
              {["المنتج", "متاجر", "صورة", "عنوان سيو", "وصف سيو", "الحالة", ""].map((h) => (
                <th key={h} className="p-3 text-start font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-teal-700/10">
                <td className="p-3">
                  <span className="font-semibold">{p.nameAr}</span>
                  {p.brand && <span className="text-ink/50 text-xs block">{p.brand}</span>}
                </td>
                <td className="p-3">
                  <span className={p.thin ? "text-rose-600 font-bold" : "text-teal-700"}>
                    {p.offersCount}
                  </span>
                </td>
                <td className="p-3">
                  {p.missingImage ? (
                    <span className="text-rose-600">ناقصة</span>
                  ) : (
                    <span className="text-save-600">✓</span>
                  )}
                </td>
                <td className="p-3">
                  {p.hasCustomTitle ? (
                    <span className="text-save-600">مخصص</span>
                  ) : (
                    <span className="text-ink/40">تلقائي</span>
                  )}
                </td>
                <td className="p-3">
                  {p.hasCustomDescription ? (
                    <span className="text-save-600">مخصص</span>
                  ) : (
                    <span className="text-ink/40">تلقائي</span>
                  )}
                </td>
                <td className="p-3">
                  {p.noindex && (
                    <span className="rounded-full bg-rose-600/10 text-rose-600 px-2 py-0.5 text-xs font-bold">
                      noindex
                    </span>
                  )}
                  {p.thin && (
                    <span className="rounded-full bg-gold-400/20 text-gold-400 px-2 py-0.5 text-xs font-bold ms-1">
                      محتوى ضعيف
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-teal-700 hover:underline font-semibold whitespace-nowrap"
                  >
                    تعديل السيو
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-ink/50 py-10">لا نتائج.</p>
        )}
      </div>
    </div>
  );
}
