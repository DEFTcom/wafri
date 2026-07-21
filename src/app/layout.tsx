import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Zain } from "next/font/google";
import Script from "next/script";
import { getSeoSettings } from "@/lib/seo";
import "./globals.css";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

// خط العناوين: Zain (بديل مجاني مرخص قريب من Fatimah/Harir).
// عند شراء ترخيص الخط المطلوب: ضع ملف woff2 في src/fonts واتبع src/fonts/README.md
const headingFont = Zain({
  variable: "--font-heading",
  subsets: ["arabic"],
  weight: ["400", "700", "800"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-body",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSeoSettings();
  return {
    title: {
      default:
        settings?.defaultMetaTitle?.trim() ||
        "وفّري | قارني أسعار منتجات العناية واشتري بأرخص سعر",
      template: "%s | وفّري",
    },
    description:
      settings?.defaultMetaDescription?.trim() ||
      "وفّري يقارن أسعار منتجات العناية بين النهدي والمتحدة ونايس ون ودار الأميرات ووايتس — نفس المنتج بأرخص سعر مع الكوبونات وتاريخ الأسعار.",
    ...((settings?.googleSiteVerification || settings?.bingSiteVerification) && {
      verification: {
        ...(settings.googleSiteVerification && { google: settings.googleSiteVerification }),
        ...(settings.bingSiteVerification && { other: { "msvalidate.01": settings.bingSiteVerification } }),
      },
    }),
    ...(settings?.twitterHandle && {
      twitter: { card: "summary_large_image", site: settings.twitterHandle },
    }),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSeoSettings();
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.organizationName || "وفّري",
    url: SITE,
    ...(settings?.organizationLogoUrl && { logo: settings.organizationLogoUrl }),
  };

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${headingFont.variable} ${plexArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-cream text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {settings?.googleAnalyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.googleAnalyticsId}');`}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
