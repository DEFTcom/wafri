import Link from "next/link";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Marquee } from "@/components/Marquee";
import { HeroCardSwap } from "@/components/HeroCardSwap";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ProductDomeGallery } from "@/components/ProductDomeGallery";
import { Reveal } from "@/components/Reveal";
import { Price, Riyal } from "@/components/Riyal";
import { SafeImage } from "@/components/SafeImage";
import { SocialProofToasts } from "@/components/SocialProofToasts";
import { StoreLogo } from "@/components/StoreLogo";
import {
  getActiveStores,
  getCategoriesWithCounts,
  getGalleryProducts,
  getMostWanted,
  getSiteStats,
  getTopSavers,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

const CATEGORY_ICONS: Record<string, string> = {
  skincare: "🧴",
  "hair-care": "💇‍♀️",
  "body-care": "🧖‍♀️",
  "oral-care": "🦷",
  "lip-care": "💋",
  "eye-care": "👁️",
  "hand-care": "💅",
  "foot-care": "🦶",
  "women-care": "🌸",
  "men-care": "🪒",
  "baby-care": "👶",
};

export default async function HomePage() {
  const [topSavers, mostWanted, stores, cats, stats, galleryProducts] = await Promise.all([
    getTopSavers(10),
    getMostWanted(10),
    getActiveStores(),
    getCategoriesWithCounts(),
    getSiteStats(),
    getGalleryProducts(),
  ]);

  const galleryImages = galleryProducts.map((p) => ({
    src: p.image_url,
    alt: p.name_ar,
    href: `/product/${p.slug ?? p.id}`,
  }));

  const heroDeals = topSavers.slice(0, 4).map((p) => ({
    id: p.id,
    slug: p.slug,
    nameAr: p.nameAr,
    imageUrl: p.imageUrl,
    cheapestPrice: p.cheapestPrice as string,
    wasPrice: String(Number(p.cheapestPrice) + Number(p.savings)),
    savings: p.savings as string,
  }));

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ── البطل ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-teal-900 text-white">
          <div className="blob w-96 h-96 bg-rose-600/60 -top-20 -start-20" />
          <div className="blob w-80 h-80 bg-save-600/50 bottom-0 end-10" style={{ animationDelay: "-7s" }} />
          <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 grid lg:grid-cols-2 gap-4 lg:gap-10 items-center">
            <div className="text-center lg:text-start">
              <Reveal>
                <p className="text-rose-100/90 font-semibold mb-4 tracking-wide">
                  نفس المنتج… ليش تدفعين أكثر؟ 👀
                </p>
              </Reveal>
              <Reveal delay={1}>
                <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-5">
                  قارني سعره…
                  <br />
                  <span className="text-rose-600">ثم وفّري</span> فرقه
                </h1>
              </Reveal>
              <Reveal delay={2}>
                <p className="text-white/75 max-w-xl mx-auto lg:mx-0 leading-8 mb-8">
                  نتابع أسعار منتجات العناية في {stores.length} متاجر سعودية
                  لحظة بلحظة، ونوريك وين الأرخص — أحياناً الفرق يوصل{" "}
                  <b className="text-gold-400">40٪</b> على نفس المنتج بالضبط.
                </p>
              </Reveal>
              <Reveal delay={3}>
                <form action="/search" className="flex max-w-lg mx-auto lg:mx-0 shadow-2xl shadow-teal-900/40 rounded-full">
                  <input
                    type="search"
                    name="q"
                    placeholder="اكتبي اسم المنتج أو الماركة…"
                    className="w-full rounded-s-full rounded-e-none bg-white text-ink px-6 py-4 outline-none"
                  />
                  <button className="rounded-e-full rounded-s-none bg-rose-600 px-8 py-4 font-bold hover:brightness-110 transition-all whitespace-nowrap">
                    قارني الآن
                  </button>
                </form>
              </Reveal>
            </div>

            {heroDeals.length > 0 && (
              <Reveal delay={2} className="hidden sm:block">
                <HeroCardSwap deals={heroDeals} />
              </Reveal>
            )}
          </div>
        </section>

        {/* ── الشريط المتحرك ────────────────────────────────── */}
        <div className="bg-rose-600 text-white text-sm font-semibold py-2.5">
          <Marquee>
            {stores.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-2 mx-6">
                <StoreLogo src={s.logoUrl} name={s.nameAr} size="sm" />
                {s.nameAr}
              </span>
            ))}
            <span className="mx-6">✦ أسعار محدثة يومياً</span>
            <span className="mx-6 inline-flex items-center gap-1">
              ✦ أعلى توفير اليوم {stats.topSaving ? <Price value={stats.topSaving} decimals={0} /> : "—"}
            </span>
            <span className="mx-6">✦ مجاناً بدون تسجيل</span>
          </Marquee>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-14 space-y-16">
          {/* ── الأكثر توفيراً ──────────────────────────────── */}
          {topSavers.length > 0 && (
            <section id="savers">
              <Reveal>
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <span className="text-save-600 font-bold text-sm">💚 فرق السعر واضح</span>
                    <h2 className="text-3xl mt-1">الأكثر توفيراً اليوم</h2>
                  </div>
                  <Link href="/category/skincare" className="arrow-link text-sm text-rose-600 font-semibold whitespace-nowrap">
                    عرض الكل <span className="arrow">←</span>
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={1}>
                <ProductCarousel products={topSavers} />
              </Reveal>
            </section>
          )}

          {/* ── الأكثر طلباً ────────────────────────────────── */}
          {mostWanted.length > 0 && (
            <section id="trending">
              <Reveal>
                <div className="flex items-end justify-between mb-5">
                  <div>
                    <span className="text-rose-600 font-bold text-sm">🔥 عليها إقبال</span>
                    <h2 className="text-3xl mt-1">الأكثر طلباً</h2>
                  </div>
                  <Link href="/category/skincare" className="arrow-link text-sm text-rose-600 font-semibold whitespace-nowrap">
                    عرض الكل <span className="arrow">←</span>
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={1}>
                <ProductCarousel products={mostWanted} />
              </Reveal>
            </section>
          )}

          {/* ── معرض المنتجات ثلاثي الأبعاد ──────────────────── */}
          {galleryImages.length > 0 && (
            <section>
              <Reveal>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">🧴</span>
                  <span className="text-teal-700 font-bold text-sm">جولة سريعة</span>
                </div>
                <h2 className="text-3xl mb-5">منتجات نراقب سعرها الآن</h2>
              </Reveal>
              <Reveal delay={1}>
                <ProductDomeGallery images={galleryImages} />
              </Reveal>
            </section>
          )}

          {/* ── لقطات السعر اليوم ─────────────────────────────── */}
          {topSavers.length > 0 && (
            <section>
              <Reveal>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">⚡</span>
                  <span className="text-rose-600 font-bold text-sm">قبل ما تفوتك</span>
                </div>
                <h2 className="text-3xl mb-5">لقطات السعر اليوم</h2>
              </Reveal>
              <div className="grid sm:grid-cols-3 gap-4">
                {topSavers.slice(0, 3).map((p, i) => (
                  <Reveal key={p.id} delay={(i % 3) as 0 | 1 | 2} className="min-w-0">
                    <Link
                      href={`/product/${p.slug ?? p.id}`}
                      className="card-hover min-w-0 flex items-center gap-3 rounded-2xl bg-white border border-teal-700/10 p-3 h-full"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold line-clamp-2">{p.nameAr}</p>
                        <p className="text-save-600 text-sm font-bold mt-1">
                          وفّري {p.savings && <Price value={p.savings} decimals={0} />}
                        </p>
                      </div>
                      <div className="relative w-16 h-16 shrink-0 rounded-xl bg-cream overflow-hidden">
                        {p.imageUrl ? (
                          <SafeImage
                            src={p.imageUrl}
                            alt={p.nameAr}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-teal-700/30 text-2xl">
                            ✦
                          </div>
                        )}
                        <span
                          className="absolute -top-1.5 -end-1.5 text-xl drop-shadow"
                          aria-hidden
                        >
                          {["🥇", "🥈", "🥉"][i]}
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* ── أقسام العناية ───────────────────────────────── */}
          <section id="categories">
            <Reveal>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <span className="text-teal-700 font-bold text-sm">✨ كل احتياجاتك</span>
                  <h2 className="text-3xl mt-1">أقسام العناية</h2>
                </div>
                <Link href="/brands" className="arrow-link text-sm text-rose-600 font-semibold whitespace-nowrap">
                  كل الماركات <span className="arrow">←</span>
                </Link>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {cats.map((c, i) => (
                <Reveal key={c.id} delay={(i % 4) as 0 | 1 | 2 | 3}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="card-hover group flex items-center gap-4 rounded-3xl bg-white border border-teal-700/10 p-5 h-full"
                  >
                    <span
                      className="cat-emoji text-4xl shrink-0"
                      style={{ animationDelay: `${(i % 5) * -0.9}s` }}
                      aria-hidden
                    >
                      {CATEGORY_ICONS[c.slug] ?? "✨"}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold leading-6">{c.nameAr}</h3>
                      {c.productsCount > 0 && (
                        <p className="text-xs text-ink/50">{c.productsCount} منتج مُقارن</p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}

              {/* بطاقة الماركات */}
              <Reveal delay={1}>
                <Link
                  href="/brands"
                  className="card-hover group flex items-center gap-4 rounded-3xl bg-rose-600 text-white p-5 h-full"
                >
                  <span className="cat-emoji text-4xl shrink-0" aria-hidden>🏷️</span>
                  <div>
                    <h3 className="font-bold leading-6">ماركات الشركات</h3>
                    <p className="text-xs text-white/70">كل الماركات بمكان واحد</p>
                  </div>
                </Link>
              </Reveal>

              {/* بطاقة دليل الأسعار */}
              <Reveal delay={2}>
                <Link
                  href="/blog"
                  className="card-hover group flex items-center gap-4 rounded-3xl bg-teal-900 text-white p-5 h-full"
                >
                  <span className="cat-emoji text-4xl shrink-0" aria-hidden>📊</span>
                  <div>
                    <h3 className="font-bold leading-6">دليل الأسعار</h3>
                    <p className="text-xs text-white/60">مقارنات محدثة يومياً</p>
                  </div>
                </Link>
              </Reveal>
            </div>
          </section>

          {/* ── أرقام حية ───────────────────────────────────── */}
          <section className="rounded-3xl bg-teal-900 text-white p-8 sm:p-12 relative overflow-hidden">
            <div className="blob w-72 h-72 bg-rose-600/40 -bottom-20 -end-20" />
            <Reveal>
              <h2 className="text-3xl mb-8 relative">أرقام تتحدث عنا</h2>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {[
                { n: `${stats.storesCount}`, label: "متاجر سعودية نراقبها" },
                { n: `${stats.productsCount}+`, label: "منتج نقارن سعره" },
                { n: `${stats.pricesTracked}+`, label: "قراءة سعر مسجلة" },
                {
                  n: stats.topSaving ? Number(stats.topSaving).toFixed(0) : "—",
                  label: "أعلى توفير بمنتج واحد اليوم",
                  riyal: true,
                },
              ].map((s, i) => (
                <Reveal key={s.label} delay={(i % 4) as 0 | 1 | 2 | 3}>
                  <div>
                    <div className="font-heading text-4xl sm:text-5xl font-bold text-gold-400 mb-1">
                      {s.n} {s.riyal && <Riyal className="h-[0.6em]" />}
                    </div>
                    <p className="text-white/70 text-sm">{s.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ── ليش وفّري؟ محتوى يمسك العميلة ────────────────── */}
          <section className="grid lg:grid-cols-3 gap-5">
            {[
              {
                icon: "🕵️‍♀️",
                title: "نراقب بدالك",
                text: "بدل ما تفتحين ٥ تطبيقات وتقارنين بنفسك، نسحب الأسعار من المتاجر كل يوم ونرتبها لك من الأرخص — بضغطة وحدة تعرفين وين الصفقة.",
              },
              {
                icon: "📉",
                title: "نعرف إذا العرض حقيقي",
                text: "نسجل تاريخ كل سعر. لما يقول المتجر «خصم 50٪» نوريك الرسم البياني: هل السعر فعلاً نزل، أو ارتفع قبل الخصم؟ ما ينضحك عليك معنا.",
              },
              {
                icon: "🎁",
                title: "كوبونات فوق التوفير",
                text: "نجمع أكواد الخصم الفعالة لكل متجر ونحطها جنب السعر مباشرة — توفير المقارنة + توفير الكوبون في نفس الصفحة.",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) as 0 | 1 | 2}>
                <div className="card-hover rounded-3xl bg-white border border-teal-700/10 p-7 h-full">
                  <span className="text-4xl block mb-4 float-soft w-fit" aria-hidden>
                    {f.icon}
                  </span>
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-ink/70 leading-7 text-sm">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </section>

          {/* ── أسئلة شائعة ─────────────────────────────────── */}
          <section className="max-w-3xl mx-auto w-full">
            <Reveal>
              <h2 className="text-3xl mb-6 text-center">أسئلة تدور ببالك</h2>
            </Reveal>
            {[
              {
                q: "هل الأسعار محدثة فعلاً؟",
                a: "نعم — نسحب الأسعار آلياً من صفحات المنتجات الرسمية مرة يومياً على الأقل، وتشوفين وقت آخر تحديث بكل صفحة. ومع ذلك السعر النهائي وقت الشراء هو المعتمد لدى المتجر.",
              },
              {
                q: "هل الشراء يتم عندكم؟",
                a: "لا، نحن لسنا متجراً. زر «اشترِ الآن» ينقلك مباشرة لصفحة المنتج في المتجر الرسمي، وتكملين الشراء هناك بحسابك وضمانات المتجر نفسه.",
              },
              {
                q: "كم تكلفني الخدمة؟",
                a: "ولا ريال. المقارنة مجانية بالكامل وبدون تسجيل. مستقبلاً قد نحصل على عمولة من بعض المتاجر عند الشراء عبر روابطنا — بدون أي زيادة على سعرك.",
              },
              {
                q: "ليش نفس المنتج سعره يختلف بين المتاجر؟",
                a: "لكل متجر سياسة تسعير وعروض وموردون مختلفون، والفرق أحياناً يتجاوز 40٪ على نفس المنتج بالضبط — وهذا بالضبط سبب وجودنا.",
              },
            ].map((f, i) => (
              <Reveal key={f.q} delay={(i % 2) as 0 | 1}>
                <details className="group rounded-2xl bg-white border border-teal-700/10 p-5 mb-3">
                  <summary className="cursor-pointer font-bold list-none flex justify-between items-center">
                    {f.q}
                    <span className="text-rose-600 transition-transform group-open:rotate-45 text-xl">＋</span>
                  </summary>
                  <p className="text-ink/70 leading-7 text-sm mt-3">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </section>

          {/* ── دعوة أخيرة ──────────────────────────────────── */}
          <Reveal>
            <section className="rounded-3xl bg-rose-600 text-white p-10 text-center relative overflow-hidden">
              <div className="blob w-60 h-60 bg-gold-400/40 -top-16 -start-16" />
              <h2 className="text-3xl mb-3 relative">جاهزة توفّرين؟</h2>
              <p className="text-white/85 mb-6 relative">
                ابحثي عن منتجك المفضل وشوفي كم الفرق بين المتاجر — بتستغربين.
              </p>
              <Link
                href="/category/skincare"
                className="inline-block rounded-full bg-white text-rose-600 font-bold px-8 py-3.5 hover:scale-105 transition-transform relative"
              >
                ابدئي المقارنة ←
              </Link>
            </section>
          </Reveal>
        </div>
      </main>
      <Footer />
      <CookieBanner />
      <SocialProofToasts />
    </>
  );
}
