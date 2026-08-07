import Link from "next/link";
import { notFound } from "next/navigation";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Price } from "@/components/Riyal";
import { SocialProofToasts } from "@/components/SocialProofToasts";
import { StoreLogo } from "@/components/StoreLogo";
import { getCategoryProducts, getStoreCountsForCategory, getSubcategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ brand?: string; sort?: string; store?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const { category, items } = await getCategoryProducts(slug);
  if (!category) return { title: "الفئة" };

  const title = `أسعار ${category.nameAr} — قارن ووفر`;
  const description = `قارن أسعار منتجات ${category.nameAr} بين المتاجر السعودية واحصل على أرخص سعر.`;
  const image = items.find((i) => i.imageUrl)?.imageUrl;

  return {
    title,
    description,
    keywords: [
      category.nameAr,
      `أسعار ${category.nameAr}`,
      "مقارنة أسعار",
      "أرخص سعر",
      "عناية بالبشرة",
    ],
    alternates: { canonical: `${SITE}/category/${category.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE}/category/${category.slug}`,
      type: "website",
      locale: "ar_SA",
      ...(image && { images: [{ url: image }] }),
    },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { brand, sort, store } = await searchParams;
  const storeId = store ? Number(store) : undefined;
  const { category, items, brands } = await getCategoryProducts(slug, {
    brand,
    sort: sort === "cheapest" ? "cheapest" : "newest",
    store: storeId,
  });
  if (!category) notFound();

  const [storeCounts, subcategories] = await Promise.all([
    getStoreCountsForCategory(category.id),
    category.parentId === null ? getSubcategories(category.id) : Promise.resolve([]),
  ]);

  const filterHref = (b?: string, s?: string, st?: number) => {
    const p = new URLSearchParams();
    if (b) p.set("brand", b);
    if (s) p.set("sort", s);
    if (st) p.set("store", String(st));
    const qs = p.toString();
    return `/category/${slug}${qs ? `?${qs}` : ""}`;
  };

  const cheapestPick = [...items].sort(
    (a, b) => Number(a.cheapestPrice ?? Infinity) - Number(b.cheapestPrice ?? Infinity)
  )[0];
  const biggestDiscountPick = [...items].sort(
    (a, b) => Number(b.savings ?? 0) - Number(a.savings ?? 0)
  )[0];

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <h1 className="text-3xl mb-2">{category.nameAr}</h1>

        {/* رقائق الأقسام الفرعية */}
        {subcategories.length > 0 && (
          <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto gap-2 mb-6 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {subcategories.map((s) => (
              <Link
                key={s.id}
                href={`/category/${s.slug}`}
                className="shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold bg-teal-700/5 text-teal-700 border border-teal-700/15 hover:bg-teal-700/10 transition-colors"
              >
                {s.nameAr} <span className="text-teal-700/50">({s.productsCount})</span>
              </Link>
            ))}
          </div>
        )}

        {/* بطاقتا الأرخص وأكبر خصم */}
        {items.length > 1 && (cheapestPick || biggestDiscountPick) && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {cheapestPick && (
              <Link
                href={`/product/${cheapestPick.slug ?? cheapestPick.id}`}
                className="card-hover flex items-center gap-3 rounded-2xl bg-teal-900 text-white p-4"
              >
                <span className="rounded-full bg-white/15 text-xs font-bold px-2.5 py-1 shrink-0">
                  🏷️ أرخص بالقسم
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{cheapestPick.nameAr}</span>
                <span className="font-bold text-gold-400 shrink-0">
                  {cheapestPick.cheapestPrice && <Price value={cheapestPick.cheapestPrice} />}
                </span>
              </Link>
            )}
            {biggestDiscountPick && Number(biggestDiscountPick.savings ?? 0) > 0 && (
              <Link
                href={`/product/${biggestDiscountPick.slug ?? biggestDiscountPick.id}`}
                className="card-hover flex items-center gap-3 rounded-2xl bg-rose-600 text-white p-4"
              >
                <span className="rounded-full bg-white/15 text-xs font-bold px-2.5 py-1 shrink-0">
                  ⚡ أكبر فرق سعر
                </span>
                <span className="min-w-0 flex-1 truncate text-sm">{biggestDiscountPick.nameAr}</span>
                <span className="font-bold shrink-0">
                  وفّر <Price value={biggestDiscountPick.savings!} decimals={0} />
                </span>
              </Link>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* فلتر المتاجر الجانبي */}
          {storeCounts.length > 0 && (
            <aside className="lg:w-56 shrink-0">
              <h2 className="text-sm font-bold text-ink/60 mb-2">فلترة حسب المتجر</h2>
              <div className="flex lg:flex-col flex-nowrap lg:flex-wrap overflow-x-auto lg:overflow-visible gap-2 pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
                <Link
                  href={filterHref(brand, sort, undefined)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm shrink-0 ${!storeId ? "bg-teal-700 text-white" : "bg-white border border-teal-700/10 hover:bg-teal-700/5"}`}
                >
                  <span className="flex-1 whitespace-nowrap">كل المتاجر</span>
                </Link>
                {storeCounts.map((s) => (
                  <Link
                    key={s.storeId}
                    href={filterHref(brand, sort, s.storeId)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm shrink-0 ${storeId === s.storeId ? "bg-teal-700 text-white" : "bg-white border border-teal-700/10 hover:bg-teal-700/5"}`}
                  >
                    <StoreLogo src={s.storeLogo} name={s.storeName} size="sm" />
                    <span className="whitespace-nowrap">{s.storeName}</span>
                    <span className={storeId === s.storeId ? "text-white/70" : "text-ink/40"}>{s.count}</span>
                  </Link>
                ))}
              </div>
            </aside>
          )}

          <div className="flex-1 min-w-0">
            {/* فلاتر أفقية */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex flex-nowrap overflow-x-auto gap-2 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                <Link
                  href={filterHref(undefined, sort, storeId)}
                  className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm border ${!brand ? "bg-teal-700 text-white border-teal-700" : "border-teal-700/30 hover:bg-teal-700/5"}`}
                >
                  كل الماركات
                </Link>
                {brands.map((b) => (
                  <Link
                    key={b}
                    href={filterHref(b, sort, storeId)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm border ${brand === b ? "bg-teal-700 text-white border-teal-700" : "border-teal-700/30 hover:bg-teal-700/5"}`}
                  >
                    {b}
                  </Link>
                ))}
              </div>
              <span className="ms-auto shrink-0 flex gap-2 text-sm">
                <Link
                  href={filterHref(brand, undefined, storeId)}
                  className={!sort || sort === "newest" ? "font-bold text-teal-700" : "text-ink/60"}
                >
                  الأحدث
                </Link>
                <span className="text-ink/30">|</span>
                <Link
                  href={filterHref(brand, "cheapest", storeId)}
                  className={sort === "cheapest" ? "font-bold text-teal-700" : "text-ink/60"}
                >
                  الأرخص
                </Link>
              </span>
            </div>

            {items.length === 0 ? (
              <p className="text-ink/60 py-16 text-center">لا توجد منتجات بعد.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <CookieBanner />
      <SocialProofToasts />
    </>
  );
}
