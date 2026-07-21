import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Reveal } from "@/components/Reveal";
import { SafeImage } from "@/components/SafeImage";
import { getBrandsWithCounts } from "@/lib/queries";
import { makeSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "ماركات العناية — قارني أسعار كل ماركة",
  description:
    "كل ماركات منتجات العناية في مكان واحد — قارني أسعار منتجات كل ماركة بين المتاجر السعودية واعرفي وين الأرخص.",
  alternates: { canonical: `${SITE}/brands` },
};

export default async function BrandsPage() {
  const brands = await getBrandsWithCounts();

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-10">
        <Reveal>
          <h1 className="text-3xl mb-2">ماركات العناية</h1>
          <p className="text-ink/60 mb-8">
            اختاري ماركتك المفضلة وشوفي أسعار كل منتجاتها بالمتاجر الخمسة.
          </p>
        </Reveal>
        {brands.length === 0 ? (
          <p className="text-ink/60 py-16 text-center">لا توجد ماركات بعد.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {brands.map((b, i) => (
              <Reveal key={b.brand} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <Link
                  href={`/brand/${encodeURIComponent(makeSlug(b.brand))}`}
                  className="card-hover group flex flex-col items-center gap-3 rounded-3xl bg-white border border-teal-700/10 p-6 text-center h-full"
                >
                  <span className="relative w-20 h-20 rounded-full bg-cream overflow-hidden flex items-center justify-center">
                    {b.imageUrl ? (
                      <SafeImage
                        src={b.imageUrl}
                        alt={b.brand}
                        fill
                        sizes="5rem"
                        className="object-contain group-hover:scale-110 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-3xl" aria-hidden>✨</span>
                    )}
                  </span>
                  <div>
                    <h2 className="font-bold" dir="auto">{b.brand}</h2>
                    <p className="text-xs text-ink/50">{b.productsCount} منتج مُقارن</p>
                  </div>
                  <span className="arrow-link text-rose-600 text-sm font-semibold mt-auto">
                    قارني الأسعار <span className="arrow">←</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
