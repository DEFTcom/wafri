// تطبيع أسماء المنتجات للمطابقة — §٤ من مستند المتطلبات

const NOISE_WORDS = [
  "عرض",
  "جديد",
  "خصم",
  "توفير",
  "حصري",
  "أصلي",
  "اصلي",
  "offer",
  "new",
  "sale",
  "original",
];

export function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "") // تشكيل وتطويل
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

// توحيد صيغ الحجم: "50 مل" / "50ml" / "50 ML" → "50ml"
export function normalizeSize(text: string): string {
  return text
    .replace(/(\d+(?:\.\d+)?)\s*(?:مل|ملي|ml)/gi, "$1ml")
    .replace(/(\d+(?:\.\d+)?)\s*(?:جم|جرام|غرام|g|gm)\b/gi, "$1g")
    .replace(/(\d+(?:\.\d+)?)\s*(?:لتر|l)\b/gi, "$1l");
}

export function normalizeTitle(title: string): string {
  let t = normalizeSize(normalizeArabic(title));
  for (const w of NOISE_WORDS) {
    t = t.replace(new RegExp(`(?<=^|\\s)${w}(?=\\s|$)`, "g"), " ");
  }
  return t.replace(/[^\p{L}\p{N}.]+/gu, " ").replace(/\s+/g, " ").trim();
}

// استخراج الحجم من العنوان إن وجد ("50ml" مثلاً) — يُستخدم كشرط صارم بالمطابقة
export function extractSize(title: string): string | null {
  const m = normalizeSize(normalizeArabic(title)).match(
    /\d+(?:\.\d+)?(?:ml|g|l)\b/
  );
  return m ? m[0] : null;
}
