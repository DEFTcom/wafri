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
