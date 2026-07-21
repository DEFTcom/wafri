import { sql } from "drizzle-orm";
import Link from "next/link";
import { db, products } from "@/db";
import { SeoSubNav } from "@/components/admin/SeoSubNav";
import { listArticles } from "@/lib/blog";
import { getArticleSeoMap, getSeoSettings } from "@/lib/seo";
import { updateSeoSettingsAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "السيو" };

export default async function SeoOverviewPage() {
  const [settings, [counts], articles, articleOverrides] = await Promise.all([
    getSeoSettings(),
    db
      .select({
        total: sql<number>`count(*)::int`,
        missingImage: sql<number>`count(*) filter (where ${products.imageUrl} is null)::int`,
        customTitle: sql<number>`count(*) filter (where ${products.metaTitle} is not null and ${products.metaTitle} <> '')::int`,
        noindex: sql<number>`count(*) filter (where ${products.noindex})::int`,
      })
      .from(products),
    listArticles(),
    getArticleSeoMap(),
  ]);

  const articlesNoindex = articles.filter((a) => articleOverrides.get(a.slug)?.noindex).length;
  const inputCls =
    "w-full rounded-xl border border-teal-700/20 px-3 py-2.5 text-sm outline-none focus:border-rose-600 transition-colors";

  return (
    <div className="space-y-6">
      <div>
        <span className="text-teal-700 font-bold text-sm">🚀 استشاري السيو</span>
        <h1 className="text-3xl mt-1">مركز السيو</h1>
      </div>

      <SeoSubNav active="/admin/seo" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="منتجات" value={counts.total} href="/admin/seo/products" />
        <StatCard
          label="عناوين سيو مخصصة"
          value={`${counts.customTitle}/${counts.total}`}
          href="/admin/seo/products"
        />
        <StatCard
          label="بدون صورة"
          value={counts.missingImage}
          warn={counts.missingImage > 0}
          href="/admin/seo/products"
        />
        <StatCard
          label="مستبعدة من البحث"
          value={counts.noindex + articlesNoindex}
          href="/admin/seo/products"
        />
      </div>

      <section className="rounded-3xl bg-white border border-teal-700/10 p-6 space-y-4">
        <h2 className="text-xl font-bold">الإعدادات العامة</h2>
        <p className="text-sm text-ink/60">
          هذي تتحكم بكل الموقع: التحقق من ملكية جوجل/بينج، معرّف Google Analytics،
          والعنوان/الوصف الافتراضي لأي صفحة ما لها تجاوز خاص بها.
        </p>
        <form action={updateSeoSettingsAction} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="default_meta_title"
              defaultValue={settings?.defaultMetaTitle ?? ""}
              placeholder="العنوان الافتراضي للموقع"
              className={inputCls}
            />
            <input
              name="organization_name"
              defaultValue={settings?.organizationName ?? "وفّري"}
              placeholder="اسم المنشأة (لبيانات Organization Schema)"
              className={inputCls}
            />
          </div>
          <textarea
            name="default_meta_description"
            defaultValue={settings?.defaultMetaDescription ?? ""}
            placeholder="الوصف الافتراضي للموقع"
            rows={2}
            className={`${inputCls} resize-none`}
          />
          <div className="grid sm:grid-cols-3 gap-3">
            <input
              name="google_site_verification"
              defaultValue={settings?.googleSiteVerification ?? ""}
              placeholder="رمز تحقق Google Search Console"
              dir="ltr"
              className={inputCls}
            />
            <input
              name="bing_site_verification"
              defaultValue={settings?.bingSiteVerification ?? ""}
              placeholder="رمز تحقق Bing Webmaster"
              dir="ltr"
              className={inputCls}
            />
            <input
              name="google_analytics_id"
              defaultValue={settings?.googleAnalyticsId ?? ""}
              placeholder="معرّف Google Analytics (G-XXXXXXX)"
              dir="ltr"
              className={inputCls}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              name="organization_logo_url"
              defaultValue={settings?.organizationLogoUrl ?? ""}
              placeholder="رابط شعار الموقع (لبيانات Organization Schema)"
              dir="ltr"
              className={inputCls}
            />
            <input
              name="twitter_handle"
              defaultValue={settings?.twitterHandle ?? ""}
              placeholder="حساب X/تويتر (مثال: @wafri)"
              dir="ltr"
              className={inputCls}
            />
          </div>
          <button className="rounded-xl bg-rose-600 text-white px-6 py-2.5 font-semibold hover:brightness-110 transition-all">
            حفظ الإعدادات
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white border border-teal-700/10 p-5 text-sm leading-7 text-ink/70">
        <h2 className="text-lg text-ink mb-2">مبني بالفعل بالموقع (بدون ما يحتاج إعداد)</h2>
        <ul className="list-disc ms-5 space-y-1">
          <li>Sitemap تلقائي (sitemap.xml) و robots.txt يشيران له</li>
          <li>روابط وصفية (slugs) عربية لكل منتج ومقال</li>
          <li>بيانات Schema.org (Product, AggregateOffer, BreadcrumbList, ItemList)</li>
          <li>تحويل 301 من الروابط الرقمية القديمة للروابط الوصفية</li>
          <li>مدونة أسعار تلقائية لكل فئة وماركة، تتحدث يومياً مع الأسعار</li>
        </ul>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  warn,
  href,
}: {
  label: string;
  value: string | number;
  warn?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card-hover rounded-2xl bg-white border border-teal-700/10 p-5 block"
    >
      <span className="text-xs text-ink/50 block">{label}</span>
      <span className={`text-2xl font-bold ${warn ? "text-rose-600" : "text-teal-700"}`}>
        {value}
      </span>
    </Link>
  );
}
