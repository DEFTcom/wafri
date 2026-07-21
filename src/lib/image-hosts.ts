// نفس نطاقات next.config.ts لكن كدالة تحقق — تُستخدم عشان صورة من نطاق
// غير مُدرج تعرض بديل عادي بدل ما توقّف الصفحة كاملة (next/image يرمي
// خطأ قاتل وقت الرندر لو النطاق مو مُدرج بـ remotePatterns).
const ALLOWED_SUFFIXES = [
  ".nahdionline.com",
  ".unitedpharmacy.sa",
  ".daralamirat.com.sa",
  ".whites.sa",
];

const ALLOWED_EXACT = ["d1aq4ubbxe020v.cloudfront.net", "cd3c14-whites.akinoncloudcdn.com"];

export function isSafeImageHost(src: string): boolean {
  try {
    const { hostname } = new URL(src);
    return (
      ALLOWED_EXACT.includes(hostname) ||
      ALLOWED_SUFFIXES.some((suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix))
    );
  } catch {
    return false;
  }
}
