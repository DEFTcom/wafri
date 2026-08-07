// خريطة ثابتة لروابط صفحات المتاجر — عدد المتاجر صغير (٥) وثابت نسبياً،
// فما يستاهل عمود slug بقاعدة البيانات وهجرة كاملة لأجله
const STORE_SLUGS: Record<string, string> = {
  النهدي: "nahdi",
  المتحدة: "united",
  "نايس ون": "niceone",
  "دار الأميرات": "dar-alamirat",
  وايتس: "whites",
};

export function storeSlug(nameAr: string): string {
  return (
    STORE_SLUGS[nameAr] ??
    nameAr
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
  );
}

export function storeNameFromSlug(slug: string): string | null {
  const entry = Object.entries(STORE_SLUGS).find(([, s]) => s === slug);
  return entry?.[0] ?? null;
}
