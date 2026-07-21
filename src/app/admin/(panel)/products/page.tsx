import { desc, eq, or, ilike, sql } from "drizzle-orm";
import { SafeImage } from "@/components/SafeImage";
import Link from "next/link";
import { db, categories, products, storeOffers, stores } from "@/db";
import { Collapsible } from "@/components/admin/Collapsible";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { ProductFormFields } from "@/components/admin/ProductFormFields";
import { Price } from "@/components/Riyal";
import { addProductAction, deleteProductAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة المنتجات" };

const PAGE_SIZE = 24;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const query = (q ?? "").trim();
  const page = Math.max(1, Number(pageParam) || 1);

  const allStores = await db.select().from(stores).where(eq(stores.isActive, true));
  const allCategories = await db.select().from(categories);

  const whereClause = query
    ? or(ilike(products.nameAr, `%${query}%`), ilike(products.brand, `%${query}%`))
    : undefined;

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(products)
    .where(whereClause);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const list = await db
    .select({
      id: products.id,
      slug: products.slug,
      nameAr: products.nameAr,
      brand: products.brand,
      imageUrl: products.imageUrl,
      offersCount: sql<number>`count(${storeOffers.id})::int`,
      cheapestPrice: sql<string | null>`min(${storeOffers.currentPrice})`,
    })
    .from(products)
    .leftJoin(storeOffers, eq(storeOffers.productId, products.id))
    .where(whereClause)
    .groupBy(products.id)
    .orderBy(desc(products.id))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return (
    <div className="space-y-8">
      <div>
        <span className="text-teal-700 font-bold text-sm">🧴 كتالوج المنتجات</span>
        <h1 className="text-3xl mt-1">إدارة المنتجات</h1>
      </div>

      <Collapsible title="إضافة منتج جديد" icon="➕">
        <form id="product-form" action={addProductAction} className="space-y-4">
          <ProductFormFields
            categories={allCategories}
            stores={allStores}
            seo={{
              metaTitle: null,
              metaDescription: null,
              noindex: false,
              previewUrl: `${(process.env.SITE_URL ?? "http://localhost:3000").replace(/^https?:\/\//, "")}/product/...`,
              autoTitle: "سعر [اسم المنتج] يبدأ من [أرخص سعر] ريال",
              autoDescription: "قارني سعر المنتج بين المتاجر — محدث يومياً مع الكوبونات وتاريخ الأسعار.",
            }}
          />
          <button className="rounded-xl bg-rose-600 text-white px-6 py-2.5 font-semibold hover:brightness-110 transition-all">
            إضافة المنتج
          </button>
        </form>
      </Collapsible>

      <section>
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <h2 className="text-xl font-bold">المنتجات ({total})</h2>
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
        </div>

        {list.length === 0 && (
          <div className="rounded-3xl bg-white border border-teal-700/10 p-10 text-center">
            <span className="text-4xl block mb-3" aria-hidden>🔍</span>
            <p className="text-ink/60">لا نتائج{query ? ` عن «${query}»` : ""}.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((p) => (
            <div
              key={p.id}
              className="card-hover flex flex-col rounded-2xl bg-white border border-teal-700/10 overflow-hidden"
            >
              <div className="relative h-40 shrink-0 bg-cream overflow-hidden flex items-center justify-center">
                {p.imageUrl ? (
                  <SafeImage
                    src={p.imageUrl}
                    alt={p.nameAr}
                    fill
                    sizes="(min-width: 1024px) 33vw, 50vw"
                    className="object-contain"
                  />
                ) : (
                  <span className="text-4xl" aria-hidden>✦</span>
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-sm font-semibold line-clamp-2">{p.nameAr}</p>
                {p.brand && <p className="text-xs text-ink/50">{p.brand}</p>}
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-teal-700 font-semibold">{p.offersCount} عروض</span>
                  {p.cheapestPrice && (
                    <span className="font-bold text-save-600">
                      من <Price value={p.cheapestPrice} />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs mt-auto pt-3">
                  <Link href={`/admin/products/${p.id}/edit`} className="text-teal-700 hover:underline font-semibold">
                    تعديل
                  </Link>
                  <a href={`/product/${p.slug ?? p.id}`} target="_blank" className="text-teal-700 hover:underline">
                    معاينة
                  </a>
                  <form action={deleteProductAction} className="ms-auto">
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmSubmitButton
                      confirmMessage={`متأكدة تبين تحذفي «${p.nameAr}»؟ هذا الإجراء لا يمكن التراجع عنه.`}
                      className="text-rose-600 hover:underline"
                    >
                      حذف
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`?${new URLSearchParams({ ...(query && { q: query }), page: String(p) })}`}
                className={`rounded-lg w-9 h-9 flex items-center justify-center text-sm font-semibold ${
                  p === page
                    ? "bg-rose-600 text-white"
                    : "bg-white border border-teal-700/10 text-teal-700 hover:bg-teal-700/5"
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
