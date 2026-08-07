import Link from "next/link";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { SocialProofToasts } from "@/components/SocialProofToasts";
import { StoreLogo } from "@/components/StoreLogo";
import { getStoreOfTheDay } from "@/lib/queries";
import { storeSlug } from "@/lib/stores";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

export async function generateMetadata() {
  const today = new Date().toLocaleDateString("ar-SA", { day: "numeric", month: "long" });
  const title = `الأوفر اليوم — أي متجر يفوز بالأسعار اليوم | وفّري`;
  const description = `كل يوم نحسب أي متجر سعودي فاز بأكبر عدد "أرخص سعر" بين منتجات العناية، ونعلن الأوفر اليوم — بتاريخ ${today}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE}/best-store` },
    openGraph: { title, description, url: `${SITE}/best-store`, type: "website", locale: "ar_SA" },
  };
}

export default async function BestStorePage() {
  const result = await getStoreOfTheDay();
  const today = new Date().toLocaleDateString("ar-SA", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        {!result ? (
          <p className="text-ink/60 py-16 text-center">ما فيه بيانات كافية بعد لحساب الأوفر اليوم.</p>
        ) : (
          <>
            <Reveal>
              <div className="rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700 text-white p-8 sm:p-12 mb-8 relative overflow-hidden text-center">
                <div className="blob w-72 h-72 bg-gold-400/30 -top-16 -start-16" aria-hidden />
                <div className="relative">
                  <span className="text-sm text-white/70">{today} — يتحدّث يومياً</span>
                  <div className="text-6xl mt-3 mb-2 float-soft" aria-hidden>🏆</div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">الأوفر اليوم</h1>
                  <p className="text-white/75 max-w-xl mx-auto mb-6">
                    حسبنا بين {result.wins > 0 ? "كل" : ""} منتجات العناية اللي نتابعها، أي متجر فاز بأكبر عدد
                    &quot;أرخص سعر&quot; — وهذا الفائز اليوم:
                  </p>
                  <Link
                    href={`/store/${storeSlug(result.store.nameAr)}`}
                    className="inline-flex items-center gap-3 rounded-2xl bg-white/10 border border-white/20 px-6 py-4 hover:bg-white/15 hover:scale-105 transition-all"
                  >
                    <StoreLogo src={result.store.logoUrl} name={result.store.nameAr} size="md" />
                    <span className="text-xl font-bold">{result.store.nameAr}</span>
                    <span className="rounded-full bg-gold-400 text-ink text-xs font-bold px-3 py-1">
                      فاز بـ {result.wins} منتج
                    </span>
                  </Link>
                </div>
              </div>
            </Reveal>

            {result.wonProducts.length > 0 && (
              <section>
                <Reveal>
                  <h2 className="text-2xl mb-5">منتجات فاز فيها {result.store.nameAr} اليوم</h2>
                </Reveal>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {result.wonProducts.map((p, i) => (
                    <Reveal key={p.id} delay={(i % 4) as 0 | 1 | 2 | 3}>
                      <ProductCard product={p} />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            <p className="mt-10 text-sm text-ink/50 text-center leading-7">
              نحسب الأوفر اليوم تلقائياً كل يوم من أسعار حقيقية محدثة — بدون رعاية أو مقابل مادي من أي متجر.
            </p>
          </>
        )}
      </main>
      <Footer />
      <CookieBanner />
      <SocialProofToasts />
    </>
  );
}
