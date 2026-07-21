import { eq } from "drizzle-orm";
import { db, products } from "../db";

// يولّد رابطاً وصفياً عربياً صديقاً لمحركات البحث من اسم المنتج
export function makeSlug(...parts: (string | null | undefined)[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^\p{Script=Arabic}a-z0-9\s-]/gu, " ")
    .trim()
    .replace(/[\s-]+/g, "-");
}

// يضمن عدم تكرار الرابط — يضيف رقماً عند التعارض
export async function uniqueProductSlug(
  nameAr: string,
  sizeVariant?: string | null
): Promise<string> {
  const base = makeSlug(nameAr, sizeVariant) || "منتج";
  let candidate = base;
  for (let n = 2; ; n++) {
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.slug, candidate));
    if (!existing) return candidate;
    candidate = `${base}-${n}`;
  }
}
