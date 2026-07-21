import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { SocialProofToasts } from "@/components/SocialProofToasts";
import { getBrandProducts, getBrandsWithCounts } from "@/lib/queries";
import { makeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

type Props = { params: Promise<{ slug: string }> };

async function resolveBrand(slug: string): Promise<string | null> {
  const brands = await getBrandsWithCounts();
  const decoded = decodeURIComponent(slug);
  return brands.find((b) => makeSlug(b.brand) === decoded)?.brand ?? null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const brand = await resolveBrand(slug);
  if (!brand) return { title: "ماركة غير موجودة" };

  const title = `أسعار منتجات ${brand} — قارني ووفّري`;
  const description = `كل منتجات ${brand} بأسعار المتاجر السعودية الخمسة — مقارنة محدثة يومياً مع أرخص سعر لكل منتج.`;
  const url = `${SITE}/brand/${encodeURIComponent(decodeURIComponent(slug))}`;
  const items = await getBrandProducts(brand);
  const image = items.find((i) => i.imageUrl)?.imageUrl;

  return {
    title,
    description,
    keywords: [brand, `منتجات ${brand}`, `أسعار ${brand}`, "مقارنة أسعار", "أرخص سعر"],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "ar_SA",
      ...(image && { images: [{ url: image }] }),
    },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await resolveBrand(slug);
  if (!brand) notFound();

  const items = await getBrandProducts(brand);

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-10">
        <nav className="text-sm text-ink/60 mb-4">
          <Link href="/" className="hover:text-teal-700">الرئيسية</Link>
          {" / "}
          <Link href="/brands" className="hover:text-teal-700">الماركات</Link>
        </nav>
        <Reveal>
          <h1 className="text-3xl mb-2" dir="auto">منتجات {brand}</h1>
          <p className="text-ink/60 mb-8">
            {items.length} منتج مُقارن — مرتبة من الأرخص.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </main>
      <Footer />
      <SocialProofToasts />
    </>
  );
}
