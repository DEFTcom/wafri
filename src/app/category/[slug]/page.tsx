import Link from "next/link";
import { notFound } from "next/navigation";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { SocialProofToasts } from "@/components/SocialProofToasts";
import { getCategoryProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ brand?: string; sort?: string }>;
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
  const { brand, sort } = await searchParams;
  const { category, items, brands } = await getCategoryProducts(slug, {
    brand,
    sort: sort === "cheapest" ? "cheapest" : "newest",
  });
  if (!category) notFound();

  const filterHref = (b?: string, s?: string) => {
    const p = new URLSearchParams();
    if (b) p.set("brand", b);
    if (s) p.set("sort", s);
    const qs = p.toString();
    return `/category/${slug}${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <h1 className="text-3xl mb-6">{category.nameAr}</h1>

        {/* فلاتر أفقية */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Link
            href={filterHref(undefined, sort)}
            className={`rounded-full px-4 py-1.5 text-sm border ${!brand ? "bg-teal-700 text-white border-teal-700" : "border-teal-700/30 hover:bg-teal-700/5"}`}
          >
            كل الماركات
          </Link>
          {brands.map((b) => (
            <Link
              key={b}
              href={filterHref(b, sort)}
              className={`rounded-full px-4 py-1.5 text-sm border ${brand === b ? "bg-teal-700 text-white border-teal-700" : "border-teal-700/30 hover:bg-teal-700/5"}`}
            >
              {b}
            </Link>
          ))}
          <span className="ms-auto flex gap-2 text-sm">
            <Link
              href={filterHref(brand, undefined)}
              className={!sort || sort === "newest" ? "font-bold text-teal-700" : "text-ink/60"}
            >
              الأحدث
            </Link>
            <span className="text-ink/30">|</span>
            <Link
              href={filterHref(brand, "cheapest")}
              className={sort === "cheapest" ? "font-bold text-teal-700" : "text-ink/60"}
            >
              الأرخص
            </Link>
          </span>
        </div>

        {items.length === 0 ? (
          <p className="text-ink/60 py-16 text-center">لا توجد منتجات بعد.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <Footer />
      <CookieBanner />
      <SocialProofToasts />
    </>
  );
}
