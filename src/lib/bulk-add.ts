// تحليل نص لصق جماعي (سطر لكل منتج) لاستخراج الاسم/الحجم/الماركة بشكل آلي
// بدون أي تخمين لروابط متاجر — الهدف فقط تسريع إدخال بيانات المنتج الأساسية،
// وربط المتاجر يصير لاحقاً يدوياً (مع أدوات البحث/المعاينة) لتفادي أي رابط خطأ.

const KNOWN_BRAND_PREFIXES = [
  "سوم باي مي",
  "غارنييه",
  "جاردن اوليان",
  "بيوديرما",
  "فازلين",
  "سيرافي",
  "كوسركس",
  "لوريال باريس",
  "جونسون",
  "يوسرين",
  "جيليت",
  "كيوفي",
  "فيتشي",
  "كارميكس",
  "ناو",
];

export function parseProductLine(rawLine: string): {
  nameAr: string;
  brand: string;
  sizeVariant: string | null;
} {
  const line = rawLine.trim();

  // آخر " - " أو " – " بالسطر يفصل الحجم/المتغير عن اسم المنتج
  const dashMatch = line.match(/^(.*)\s[-–]\s(.+)$/);
  const base = dashMatch ? dashMatch[1].trim() : line;
  const sizeVariant = dashMatch ? dashMatch[2].trim() : null;

  // الماركة: بعد آخر كلمة "من" مستقلة بنهاية الاسم (مو أول "من" — قد يتكرر
  // بمنتصف الوصف مثل "مستخلص من القهوة") — أو ماركة معروفة تبدأ بيها الجملة
  let brand = "";
  const words = base.split(/\s+/);
  let lastMenIdx = -1;
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i] === "من") lastMenIdx = i;
  }
  if (lastMenIdx !== -1) {
    brand = words.slice(lastMenIdx + 1).join(" ").trim();
  } else {
    const prefix = KNOWN_BRAND_PREFIXES.find((b) => base.startsWith(b));
    if (prefix) brand = prefix;
  }

  return { nameAr: base, brand, sizeVariant };
}

// تخمين القسم من كلمات مفتاحية بالاسم — قابل للتعديل يدوياً بعدين من صفحة التعديل
const CATEGORY_KEYWORDS: { slug: string; keywords: string[] }[] = [
  { slug: "oral-care", keywords: ["معجون", "أسنان", "اللسان", "الفم"] },
  { slug: "lip-care", keywords: ["شفاه", "الشفاه"] },
  { slug: "eye-care", keywords: ["العين", "الرموش", "رموش"] },
  { slug: "hand-care", keywords: ["اليدين", "اليد "] },
  { slug: "foot-care", keywords: ["القدمين", "القدم"] },
  {
    slug: "women-care",
    keywords: ["نسائية", "حميمة", "فيمفريش", "فينوس", "المرأة"],
  },
  {
    slug: "hair-care",
    keywords: ["شعر", "الشعر", "شامبو", "بلسم", "فروة الرأس", "تصفيف"],
  },
  {
    slug: "body-care",
    keywords: [
      "الجسم",
      "صابون",
      "لوشن",
      "الحمام",
      "بودرة الجسم",
      "زبدة",
      "الليفة",
      "حلاقة",
    ],
  },
];

export function guessCategorySlug(nameAr: string): string {
  for (const { slug, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => nameAr.includes(k))) return slug;
  }
  return "skincare";
}
