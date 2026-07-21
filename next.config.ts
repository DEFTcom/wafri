import type { NextConfig } from "next";

// صور المنتجات تُسحب من نطاقات CDN كل متجر. نستخدم wildcard لكل نطاق متجر
// (**.nahdionline.com إلخ) عشان تغيّر المتجر لنطاق فرعي جديد ما يكسر الموقع.
// نطاقات CDN مشتركة (cloudfront/akinoncloudcdn) لازم نطاق دقيق — ما نقدر
// نعمل wildcard عليها لأنها تخدم عملاء كُثر غير متجرنا.
// ⚠️ أي إضافة/تغيير جذري بنطاق متجر جديد لازم يُضاف هنا. راجعي أيضاً
// src/lib/image-hosts.ts — هو خط الدفاع الثاني اللي يمنع انهيار الصفحة
// كاملة لو ظهر نطاق غير مُدرج (يعرض بديل بدل ما يوقف كل شي).
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "nahdionline.com" },
      { protocol: "https", hostname: "**.nahdionline.com" },
      { protocol: "https", hostname: "unitedpharmacy.sa" },
      { protocol: "https", hostname: "**.unitedpharmacy.sa" },
      { protocol: "https", hostname: "daralamirat.com.sa" },
      { protocol: "https", hostname: "**.daralamirat.com.sa" },
      { protocol: "https", hostname: "whites.sa" },
      { protocol: "https", hostname: "**.whites.sa" },
      { protocol: "https", hostname: "d1aq4ubbxe020v.cloudfront.net" },
      { protocol: "https", hostname: "cd3c14-whites.akinoncloudcdn.com" },
    ],
  },
};

export default nextConfig;
