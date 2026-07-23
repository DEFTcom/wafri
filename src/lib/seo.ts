import { eq } from "drizzle-orm";
import { articleSeo, db, seoSettings } from "@/db";

// نطاقات الطول المثالية لعرض جوجل بدون قص (تقريبية، بالحروف)
export const TITLE_RANGE = { min: 30, max: 60 };
export const DESCRIPTION_RANGE = { min: 70, max: 160 };

export type LengthStatus = "empty" | "short" | "good" | "long";

export function lengthStatus(
  value: string | null | undefined,
  range: { min: number; max: number }
): LengthStatus {
  const len = (value ?? "").trim().length;
  if (len === 0) return "empty";
  if (len < range.min) return "short";
  if (len > range.max) return "long";
  return "good";
}

// إعدادات السيو العامة — صف واحد ثابت (id=1)، يُنشأ تلقائياً عند أول قراءة
export async function getSeoSettings() {
  const [existing] = await db.select().from(seoSettings).where(eq(seoSettings.id, 1));
  if (existing) return existing;
  const [created] = await db
    .insert(seoSettings)
    .values({ id: 1 })
    .onConflictDoNothing()
    .returning();
  return created ?? (await db.select().from(seoSettings).where(eq(seoSettings.id, 1)))[0];
}

export async function getArticleSeo(slug: string) {
  const [row] = await db.select().from(articleSeo).where(eq(articleSeo.slug, slug));
  return row ?? null;
}

export async function getArticleSeoMap(): Promise<Map<string, typeof articleSeo.$inferSelect>> {
  const rows = await db.select().from(articleSeo);
  return new Map(rows.map((r) => [r.slug, r]));
}

// العنوان/الوصف التلقائيان لصفحة منتج — نفس المنطق المستخدم بصفحة المنتج
// الفعلية، معاد استخدامه في لوحة الإدارة لمعاينة السيو قبل أي تجاوز يدوي
export function buildProductAutoMeta(
  product: { nameAr: string; brand: string; sizeVariant: string | null },
  offers: { storeName: string; currentPrice: string | null; isAvailable: boolean }[]
) {
  const available = offers.filter((o) => o.isAvailable && o.currentPrice);
  const cheapest = available[0];
  const storeNames = offers.map((o) => o.storeName);
  const title = `سعر ${product.nameAr}${product.sizeVariant ? ` ${product.sizeVariant}` : ""}${cheapest ? ` يبدأ من ${Number(cheapest.currentPrice).toFixed(2)} ريال` : ""}`;
  const description = `قارن سعر ${product.nameAr} ${product.brand} بين ${storeNames.join(" و")} — محدث يومياً مع الكوبونات وتاريخ الأسعار. أرخص سعر الآن${cheapest ? ` ${Number(cheapest.currentPrice).toFixed(2)} ريال من ${cheapest.storeName}` : ""}.`;
  return { title, description };
}

// مولّد سيو "ذكي" مجاني (بدون أي API) — قواعد سيو حديثة: كلمة مفتاحية أول
// العنوان، رقم ملموس (سعر/توفير) لجذب النقر، إشارات حداثة وثقة (عدد المتاجر،
// تحديث يومي) بالوصف، وطول متوافق مع حدود عرض جوجل.
export function buildSmartProductSeo(
  product: { nameAr: string; brand: string; sizeVariant: string | null },
  offers: { storeName: string; currentPrice: string | null; isAvailable: boolean }[],
  categoryName?: string
) {
  const year = new Date().getFullYear();
  const available = offers
    .filter((o) => o.isAvailable && o.currentPrice)
    .sort((a, b) => Number(a.currentPrice) - Number(b.currentPrice));
  const cheapest = available[0];
  const priciest = available[available.length - 1];
  const storeCount = offers.length;
  const savings =
    cheapest && priciest && cheapest !== priciest
      ? Number(priciest.currentPrice) - Number(cheapest.currentPrice)
      : 0;

  const namePart = `${product.brand ? `${product.brand} ` : ""}${product.nameAr}${
    product.sizeVariant ? ` ${product.sizeVariant}` : ""
  }`.trim();

  let title = cheapest
    ? `سعر ${namePart} من ${Number(cheapest.currentPrice).toFixed(0)} ريال ${year} | وفّري`
    : `سعر ${namePart} ${year} - قارني الأسعار | وفّري`;
  if (title.length > TITLE_RANGE.max) {
    title = cheapest
      ? `سعر ${namePart} ${Number(cheapest.currentPrice).toFixed(0)} ر.س | وفّري`
      : `${namePart} - سعر وعروض | وفّري`;
  }
  if (title.length > TITLE_RANGE.max) title = `${title.slice(0, TITLE_RANGE.max - 1).trimEnd()}…`;

  const parts: string[] = [
    `قارني سعر ${namePart}${categoryName ? ` (${categoryName})` : ""} بين ${storeCount} متاجر سعودية موثوقة`,
  ];
  if (cheapest) parts.push(`أرخص سعر الآن ${Number(cheapest.currentPrice).toFixed(2)} ريال من ${cheapest.storeName}`);
  if (savings > 1) parts.push(`وفّري حتى ${savings.toFixed(0)} ريال`);
  parts.push("أسعار وكوبونات محدثة يومياً");
  let description = `${parts.join(" — ")}.`;
  if (description.length > DESCRIPTION_RANGE.max) {
    description = `${description.slice(0, DESCRIPTION_RANGE.max - 1).trimEnd()}…`;
  }
  if (description.length < DESCRIPTION_RANGE.min) description += " تسوقي بذكاء مع وفّري.";

  return { title, description };
}

// نفس فكرة buildSmartProductSeo لكن لمقالات المدونة التلقائية (فئة/ماركة) —
// بدون AI، كلمة مفتاحية + رقم (عدد المنتجات) + سنة الحداثة + وسم الموقع
export function buildSmartArticleSeo(article: {
  type: "category" | "brand";
  subjectName: string;
  productsCount: number;
}) {
  const year = new Date().getFullYear();
  const subject = article.type === "category" ? article.subjectName : `منتجات ${article.subjectName}`;

  let title = `أرخص سعر ${subject} ${year} — مقارنة ${article.productsCount} منتج | وفّري`;
  if (title.length > TITLE_RANGE.max) title = `أرخص سعر ${subject} ${year} | وفّري`;
  if (title.length > TITLE_RANGE.max) title = `${title.slice(0, TITLE_RANGE.max - 1).trimEnd()}…`;

  let description = `قارني سعر ${subject} بين أكبر المتاجر السعودية أونلاين — ${article.productsCount} منتج مقارن بأسعار محدثة يومياً مع الكوبونات وتاريخ الأسعار. اكتشفي أرخص خيار الآن.`;
  if (description.length > DESCRIPTION_RANGE.max) {
    description = `${description.slice(0, DESCRIPTION_RANGE.max - 1).trimEnd()}…`;
  }
  if (description.length < DESCRIPTION_RANGE.min) description += " تحديث يومي مضمون.";

  return { title, description };
}
