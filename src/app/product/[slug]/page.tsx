import { cookies } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PriceChart } from "@/components/PriceChart";
import { Price } from "@/components/Riyal";
import { SafeImage } from "@/components/SafeImage";
import { SocialProofToasts } from "@/components/SocialProofToasts";
import { StarRating } from "@/components/StarRating";
import { StoreLogo } from "@/components/StoreLogo";
import { ProductReviews } from "@/components/ProductReviews";
import {
  getApprovedReviews,
  getPriceHistory,
  getProductDetail,
  getProductRatingSummary,
} from "@/lib/queries";
import { flattenProductDescription, parseProductDescription } from "@/lib/product-description";
import { buildProductAutoMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const detail = await getProductDetail(decodeURIComponent(slug));
  if (!detail) return { title: "منتج غير موجود" };
  const { product, offers } = detail;
  const storeNames = offers.map((o) => o.storeName);
  const auto = buildProductAutoMeta(product, offers);
  const title = product.metaTitle?.trim() || auto.title;
  const description =
    product.metaDescription?.trim() ||
    (product.description?.trim() ? flattenProductDescription(product.description) : "") ||
    auto.description;

  return {
    title,
    description,
    keywords: [
      product.nameAr,
      product.brand,
      `سعر ${product.nameAr}`,
      "مقارنة أسعار",
      "أرخص سعر",
      "عناية بالبشرة",
      ...storeNames,
    ].filter(Boolean),
    alternates: { canonical: `${SITE}/product/${product.slug ?? product.id}` },
    ...(product.noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      url: `${SITE}/product/${product.slug ?? product.id}`,
      type: "website",
      locale: "ar_SA",
      ...(product.imageUrl && { images: [{ url: product.imageUrl }] }),
    },
  };
}

function OfferRow({
  offer,
  highlight,
}: {
  offer: NonNullable<Awaited<ReturnType<typeof getProductDetail>>>["offers"][number];
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-xl p-4 ${highlight ? "bg-save-600/10 border-2 border-save-600" : "bg-white border border-teal-700/10"}`}
    >
      <StoreLogo src={offer.storeLogo} name={offer.storeName} />
      <div className="flex-1">
        <span className="font-bold">{offer.storeName}</span>
        {!offer.isAvailable && (
          <span className="ms-2 text-xs text-rose-600">غير متوفر حالياً</span>
        )}
        {offer.couponCode && (
          <div className="text-xs text-save-600 mt-1">
            كوبون <b dir="ltr">{offer.couponCode}</b>
            {offer.couponDiscountPercent
              ? ` — خصم ${Number(offer.couponDiscountPercent)}٪`
              : ""}
          </div>
        )}
      </div>
      <div className="text-xl font-bold text-teal-700">
        {offer.currentPrice ? <Price value={offer.currentPrice} /> : "—"}
      </div>
      <a
        href={`/go/${offer.id}`}
        rel="nofollow sponsored"
        target="_blank"
        className={`rounded-xl px-5 py-2.5 font-semibold text-white ${highlight ? "bg-save-600" : "bg-rose-600"} hover:opacity-90`}
      >
        اشترِ الآن
      </a>
    </div>
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const detail = await getProductDetail(decoded);
  if (!detail) notFound();
  const { product, offers, category } = detail;

  // الروابط الرقمية القديمة تتحول 301 للرابط الوصفي (سيو)
  if (/^\d+$/.test(decoded) && product.slug) {
    permanentRedirect(`/product/${encodeURIComponent(product.slug)}`);
  }

  const available = offers.filter((o) => o.isAvailable && o.currentPrice);
  const [cheapest, ...rest] = available;
  const unavailable = offers.filter((o) => !o.isAvailable || !o.currentPrice);
  const history = await getPriceHistory(product.id);
  const sessionId = (await cookies()).get("sid")?.value ?? null;
  const rating = await getProductRatingSummary(product.id, sessionId);
  const reviews = await getApprovedReviews(product.id);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.nameAr,
      ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
      ...(product.imageUrl && { image: product.imageUrl }),
      ...(product.description?.trim() && {
        description: flattenProductDescription(product.description),
      }),
      ...(rating.count > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating.average.toFixed(1),
          reviewCount: rating.count,
        },
      }),
      ...(available.length > 0 && {
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "SAR",
          lowPrice: Number(available[0].currentPrice),
          highPrice: Number(available[available.length - 1].currentPrice),
          offerCount: available.length,
        },
      }),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE },
        ...(category
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: category.nameAr,
                item: `${SITE}/category/${category.slug}`,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: 3,
          name: product.nameAr,
          item: `${SITE}/product/${product.slug ?? product.id}`,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative w-full sm:w-64 shrink-0 aspect-square rounded-2xl bg-white border border-teal-700/10 overflow-hidden">
            {product.imageUrl && (
              <SafeImage
                src={product.imageUrl}
                alt={`${product.nameAr} — مقارنة الأسعار`}
                fill
                sizes="(min-width: 640px) 16rem, 100vw"
                className="object-contain"
                priority
              />
            )}
          </div>
          <div className="flex-1">
            {product.brand && (
              <span className="text-sm text-teal-700/70">{product.brand}</span>
            )}
            <h1 className="text-2xl sm:text-3xl mb-4">
              {product.nameAr}
              {product.sizeVariant ? ` — ${product.sizeVariant}` : ""}
            </h1>

            <StarRating
              productId={product.id}
              slug={product.slug ?? String(product.id)}
              average={rating.average}
              count={rating.count}
              myRating={rating.myRating}
              myComment={rating.myComment}
            />

            {product.description?.trim() && (
              <div className="space-y-3 mb-4">
                {parseProductDescription(product.description).map((block, i) => (
                  <div key={i}>
                    {block.heading && (
                      <h2 className="text-sm font-bold text-teal-900 mb-1">{block.heading}</h2>
                    )}
                    {block.paragraphs.map((p, j) => (
                      <p key={j} className="text-sm text-ink/70 leading-7">
                        {p}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* أرخص سعر بارز أعلى الصفحة — التصميم الهجين */}
            {cheapest ? (
              <div className="space-y-3">
                <div className="text-sm text-save-600 font-bold">
                  ✓ أرخص سعر الآن
                </div>
                <OfferRow offer={cheapest} highlight />
              </div>
            ) : (
              <p className="text-ink/60">غير متوفر بأي متجر حالياً.</p>
            )}
          </div>
        </div>

        {/* باقي المتاجر — قائمة مطوية */}
        {(rest.length > 0 || unavailable.length > 0) && (
          <details className="group" open={rest.length > 0}>
            <summary className="cursor-pointer text-teal-700 font-semibold mb-3 list-none">
              <span className="group-open:hidden">
                ▼ عرض باقي المتاجر ({rest.length + unavailable.length})
              </span>
              <span className="hidden group-open:inline">▲ إخفاء باقي المتاجر</span>
            </summary>
            <div className="space-y-3">
              {rest.map((o) => (
                <OfferRow key={o.id} offer={o} />
              ))}
              {unavailable.map((o) => (
                <OfferRow key={o.id} offer={o} />
              ))}
            </div>
          </details>
        )}

        <PriceChart points={history} />

        <ProductReviews reviews={reviews} />
      </main>
      <Footer />
      <CookieBanner />
      <SocialProofToasts />
    </>
  );
}
