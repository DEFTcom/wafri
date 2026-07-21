import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import {
  BRAND_BUYING_GUIDE,
  CATEGORY_BUYING_GUIDE,
  buildDirectAnswer,
  buildFAQ,
  computeStats,
} from "@/lib/article-content";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Price } from "@/components/Riyal";
import { SafeImage } from "@/components/SafeImage";
import { SocialProofToasts } from "@/components/SocialProofToasts";
import { categories, db, products, storeOffers, stores } from "@/db";
import { findArticle, listArticles } from "@/lib/blog";
import { getActiveStores } from "@/lib/queries";
import { getArticleSeo } from "@/lib/seo";

export const dynamic = "force-dynamic";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await findArticle(decodeURIComponent(slug));
  if (!article) return { title: "مقال غير موجود" };
  const override = await getArticleSeo(article.slug);
  const title = override?.metaTitle?.trim() || article.title;
  const description = override?.metaDescription?.trim() || article.description;
  return {
    title,
    description,
    keywords: [
      article.title,
      "مقارنة أسعار",
      "أرخص سعر",
      "عناية بالبشرة",
      "النهدي",
      "نايس ون",
      "وايتس",
      "صيدلية المتحدة",
      "دار الأميرات",
    ],
    alternates: { canonical: `${SITE}/blog/${article.slug}` },
    ...(override?.noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      title,
      description,
      url: `${SITE}/blog/${article.slug}`,
      type: "article",
      locale: "ar_SA",
      ...(article.imageUrl && { images: [{ url: article.imageUrl }] }),
    },
  };
}

// صفوف الجدول: منتج + أرخص متجر وسعره + التوفير مقابل أغلى متجر
async function getRows(article: { type: string; key: string }) {
  const base = db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.nameAr,
      brand: products.brand,
      size: products.sizeVariant,
      cheapest: sql<string>`min(${storeOffers.currentPrice})`,
      savings: sql<string | null>`nullif(max(${storeOffers.currentPrice}) - min(${storeOffers.currentPrice}), 0)`,
      offersCount: sql<number>`count(*)::int`,
    })
    .from(products)
    .innerJoin(
      storeOffers,
      and(
        eq(storeOffers.productId, products.id),
        eq(storeOffers.isAvailable, true),
        sql`${storeOffers.currentPrice} is not null`
      )
    )
    .groupBy(products.id)
    .orderBy(sql`min(${storeOffers.currentPrice}) asc`);

  if (article.type === "brand") {
    return base.where(eq(products.brand, article.key));
  }
  const [cat] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, article.key));
  if (!cat) return [];
  return base.where(eq(products.categoryId, cat.id));
}

async function cheapestStoreFor(productId: number, price: string) {
  const [row] = await db
    .select({ name: stores.nameAr, offerId: storeOffers.id })
    .from(storeOffers)
    .innerJoin(stores, eq(stores.id, storeOffers.storeId))
    .where(
      and(eq(storeOffers.productId, productId), eq(storeOffers.currentPrice, price))
    )
    .limit(1);
  return row;
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await findArticle(decodeURIComponent(slug));
  if (!article) notFound();
  const override = await getArticleSeo(article.slug);

  const rows = await getRows(article);
  const activeStores = await getActiveStores();
  const withStores = await Promise.all(
    rows.map(async (r) => ({
      ...r,
      cheapestStore: await cheapestStoreFor(r.id, r.cheapest),
    }))
  );

  const stats = computeStats(withStores);
  const directAnswer = buildDirectAnswer(article, stats);
  const faq = buildFAQ(article, stats);
  const buyingGuide =
    article.type === "category" ? (CATEGORY_BUYING_GUIDE[article.key] ?? BRAND_BUYING_GUIDE) : BRAND_BUYING_GUIDE;

  const allArticles = await listArticles();
  const related = allArticles.filter((a) => a.slug !== article.slug).slice(0, 4);

  const today = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: article.title,
      itemListElement: withStores.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: r.name,
        url: `${SITE}/product/${r.slug ?? r.id}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE },
        { "@type": "ListItem", position: 2, name: "دليل الأسعار", item: `${SITE}/blog` },
        { "@type": "ListItem", position: 3, name: article.title, item: `${SITE}/blog/${article.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-10 space-y-6">
        <nav className="text-sm text-ink/60">
          <Link href="/" className="hover:text-teal-700">الرئيسية</Link>
          {" / "}
          <Link href="/blog" className="hover:text-teal-700">دليل الأسعار</Link>
        </nav>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {article.imageUrl && (
            <div className="relative w-full sm:w-52 h-44 shrink-0 rounded-3xl bg-white border border-teal-700/10 p-4 overflow-hidden">
              <SafeImage
                src={article.imageUrl}
                alt={article.title}
                fill
                sizes="(min-width: 640px) 13rem, 100vw"
                className="object-contain p-4 float-soft"
                priority
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl leading-relaxed">{article.title}</h1>
            <p className="text-sm text-ink/50 mt-2">آخر تحديث: {today} — الأسعار تُسحب يومياً من المتاجر مباشرة.</p>
          </div>
        </div>

        {/* الجواب المباشر — أول ما يقرأه الزائر ومحركات البحث بالذكاء الاصطناعي */}
        {withStores.length > 0 && (
          <div className="rounded-2xl bg-teal-900 text-white p-5">
            <span className="text-xs font-bold text-gold-400 block mb-1.5">⚡ الخلاصة</span>
            <p className="leading-7 text-lg">{directAnswer}</p>
          </div>
        )}

        {override?.introOverride?.trim() ? (
          <p className="leading-8">{override.introOverride}</p>
        ) : (
          <p className="leading-8">
            {article.description} قارنّا الأسعار بين{" "}
            {activeStores.map((s, i) => (
              <span key={s.id}>
                <b>{s.nameAr}</b>
                {i < activeStores.length - 1 ? " و" : ""}
              </span>
            ))}{" "}
            حتى توفرين فرق السعر بدل ما تدورين بنفسك. اضغطي على أي منتج لمشاهدة
            كل العروض وتاريخ السعر.
          </p>
        )}

        {withStores.length > 0 && (
          <nav aria-label="محتويات المقال" className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-teal-700 border-y border-teal-700/10 py-3">
            <a href="#جدول-الأسعار" className="hover:underline">📊 جدول المقارنة</a>
            <a href="#الأسئلة-الشائعة" className="hover:underline">❓ الأسئلة الشائعة</a>
            <a href="#دليل-الشراء" className="hover:underline">📚 دليل الشراء</a>
          </nav>
        )}

        {withStores.length === 0 ? (
          <p className="text-ink/60 py-10 text-center">لا توجد منتجات بأسعار متوفرة حالياً.</p>
        ) : (
          <div id="جدول-الأسعار" className="overflow-x-auto rounded-2xl border border-teal-700/10 bg-white scroll-mt-20">
            <table className="w-full text-sm">
              <thead className="bg-teal-700/5">
                <tr>
                  {["المنتج", "أرخص سعر", "من متجر", "التوفير", ""].map((h) => (
                    <th key={h} className="p-3 text-start font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withStores.map((r) => (
                  <tr key={r.id} className="border-t border-teal-700/10">
                    <td className="p-3">
                      <Link href={`/product/${r.slug ?? r.id}`} className="text-teal-700 font-semibold hover:underline">
                        {r.name}
                        {r.size ? ` — ${r.size}` : ""}
                      </Link>
                    </td>
                    <td className="p-3 font-bold text-teal-700">
                      <Price value={r.cheapest} />
                    </td>
                    <td className="p-3">{r.cheapestStore?.name ?? "—"}</td>
                    <td className="p-3">
                      {r.savings ? (
                        <span className="text-save-600 font-bold inline-flex">
                          <Price value={r.savings} decimals={0} />
                        </span>
                      ) : (
                        <span className="text-ink/40">متجر واحد</span>
                      )}
                    </td>
                    <td className="p-3">
                      {r.cheapestStore && (
                        <a
                          href={`/go/${r.cheapestStore.offerId}`}
                          rel="nofollow sponsored"
                          target="_blank"
                          className="rounded-lg bg-rose-600 text-white px-4 py-1.5 text-xs font-semibold whitespace-nowrap"
                        >
                          اشترِ الآن
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {withStores.length > 0 && (
          <section id="الأسئلة-الشائعة" className="scroll-mt-20 space-y-3">
            <h2 className="text-2xl">❓ الأسئلة الشائعة</h2>
            <div className="space-y-2">
              {faq.map((f) => (
                <details key={f.question} className="group rounded-2xl bg-white border border-teal-700/10 p-4">
                  <summary className="cursor-pointer font-semibold flex items-center gap-2 list-none">
                    <span className="text-rose-600 transition-transform group-open:rotate-90">←</span>
                    <span className="text-lg">{f.question}</span>
                  </summary>
                  <p className="text-sm text-ink/70 leading-7 mt-2 ps-6">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <section id="دليل-الشراء" className="scroll-mt-20 rounded-2xl bg-white border border-teal-700/10 p-5">
          <h2 className="text-lg text-ink mb-3">📚 دليل الشراء</h2>
          <ul className="space-y-2 text-sm leading-7 text-ink/70">
            {buyingGuide.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span className="text-save-600 shrink-0" aria-hidden>✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl bg-white border border-teal-700/10 p-5 text-sm leading-7 text-ink/70">
          <h2 className="text-lg text-ink mb-2">كيف نجمع هذه الأسعار؟</h2>
          <p>
            نسحب الأسعار آلياً من صفحات المنتجات الرسمية في المتاجر مرة يومياً
            على الأقل، ونسجل تاريخ كل سعر حتى نعرف إن كان العرض الحالي حقيقياً.
            الأسعار النهائية قد تختلف وقت الشراء — تأكدي من صفحة المتجر.
          </p>
        </section>

        {related.length > 0 && (
          <section>
            <h2 className="text-lg text-ink mb-3">مقالات ذات صلة</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((a) => (
                <Link
                  key={a.slug}
                  href={`/blog/${a.slug}`}
                  className="rounded-xl bg-white border border-teal-700/10 p-4 text-sm font-semibold text-teal-700 hover:bg-teal-700/5 transition-colors"
                >
                  {a.title}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <SocialProofToasts />
    </>
  );
}
