import Link from "next/link";
import { notFound } from "next/navigation";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { SocialProofToasts } from "@/components/SocialProofToasts";
import { StoreLogo } from "@/components/StoreLogo";
import { getActiveStores, getStoreDetail } from "@/lib/queries";
import { storeNameFromSlug, storeSlug } from "@/lib/stores";

export const dynamic = "force-dynamic";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

type Props = { params: Promise<{ slug: string }> };

async function resolveStoreId(slug: string) {
  const nameAr = storeNameFromSlug(slug);
  const stores = await getActiveStores();
  const match = nameAr
    ? stores.find((s) => s.nameAr === nameAr)
    : stores.find((s) => storeSlug(s.nameAr) === slug);
  return match?.id ?? null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const storeId = await resolveStoreId(slug);
  if (!storeId) return { title: "المتجر" };
  const detail = await getStoreDetail(storeId);
  if (!detail) return { title: "المتجر" };

  const title = `أسعار متجر ${detail.store.nameAr} — قارن ووفّر`;
  const description = `تصفحي كل منتجات العناية المتوفرة بمتجر ${detail.store.nameAr} مع مقارنة سعرها بأقرب المتاجر السعودية الأخرى.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE}/store/${slug}` },
    openGraph: { title, description, url: `${SITE}/store/${slug}`, type: "website", locale: "ar_SA" },
  };
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params;
  const storeId = await resolveStoreId(slug);
  if (!storeId) notFound();
  const detail = await getStoreDetail(storeId);
  if (!detail) notFound();
  const { store, items } = detail;

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <Reveal>
          <div className="rounded-3xl bg-teal-900 text-white p-6 sm:p-8 mb-8 relative overflow-hidden">
            <div className="blob w-64 h-64 bg-rose-600/40 -top-16 -end-16" aria-hidden />
            <div className="relative flex items-center gap-4">
              <StoreLogo src={store.logoUrl} name={store.nameAr} size="md" />
              <div>
                <span className="text-sm text-white/70">صفحة متجر</span>
                <h1 className="text-2xl sm:text-3xl font-bold">{store.nameAr}</h1>
              </div>
            </div>
            <p className="relative mt-4 text-white/80 text-sm leading-7 max-w-2xl">
              نقارن أسعار {store.nameAr} أولاً بأول مع باقي المتاجر السعودية، عشان تعرفي
              إذا هو فعلاً الأرخص قبل ما تشترين. حالياً نتابع{" "}
              <b className="text-gold-400">{items.length}</b> منتج من {store.nameAr}.
            </p>
          </div>
        </Reveal>

        {items.length === 0 ? (
          <p className="text-ink/60 py-16 text-center">لا توجد منتجات مُتابَعة من هذا المتجر حالياً.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}

        <p className="mt-10 text-sm text-ink/50 text-center">
          تبين متاجر ثانية؟{" "}
          <Link href="/#categories" className="text-teal-700 font-semibold hover:underline">
            تصفحي كل الأقسام
          </Link>
        </p>
      </main>
      <Footer />
      <CookieBanner />
      <SocialProofToasts />
    </>
  );
}
