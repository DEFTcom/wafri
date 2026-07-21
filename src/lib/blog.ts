import { eq, sql } from "drizzle-orm";
import { categories, db, products } from "../db";
import { makeSlug } from "./slug";

// المدونة التلقائية: مقالات تتولد من قاعدة البيانات وتتحدث مع كل سحب أسعار.
// نوعان: «أرخص أسعار {فئة}» و«أسعار منتجات {ماركة}» — بدون أي كتابة يدوية.
// صورة كل مقال: صورة منتج حقيقي من نفس الفئة/الماركة.

export type BlogArticle = {
  slug: string;
  title: string;
  type: "category" | "brand";
  key: string; // slug الفئة أو اسم الماركة
  description: string;
  imageUrl: string | null;
  productsCount: number;
  subjectName: string; // اسم الفئة أو الماركة نظيف بدون صياغة العنوان — يُستخدم بالمحتوى المولّد
};

export async function listArticles(): Promise<BlogArticle[]> {
  const cats = await db
    .select({
      nameAr: categories.nameAr,
      slug: categories.slug,
      imageUrl: sql<string | null>`min(${products.imageUrl}) filter (where ${products.imageUrl} is not null)`,
      productsCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id);

  const brands = await db
    .select({
      brand: products.brand,
      imageUrl: sql<string | null>`min(${products.imageUrl}) filter (where ${products.imageUrl} is not null)`,
      productsCount: sql<number>`count(${products.id})::int`,
    })
    .from(products)
    .where(sql`${products.brand} <> ''`)
    .groupBy(products.brand);

  return [
    // مقالات الفئات — فقط للفئات اللي فيها منتجات (ما ننشر صفحات فاضية لجوجل)
    ...cats
      .filter((c) => c.productsCount > 0)
      .map(
        (c): BlogArticle => ({
          slug: `ارخص-اسعار-${makeSlug(c.nameAr)}`,
          title: `أرخص أسعار ${c.nameAr} في السعودية — مقارنة محدثة يومياً`,
          type: "category",
          key: c.slug,
          description: `قائمة أرخص منتجات ${c.nameAr} بأسعار اليوم من النهدي والمتحدة ونايس ون ودار الأميرات ووايتس، مع فرق الأسعار بين المتاجر.`,
          imageUrl: c.imageUrl,
          productsCount: c.productsCount,
          subjectName: c.nameAr,
        })
      ),
    ...brands.map(
      (b): BlogArticle => ({
        slug: `اسعار-منتجات-${makeSlug(b.brand)}`,
        title: `أسعار منتجات ${b.brand} في السعودية — أين تشترين أرخص؟`,
        type: "brand",
        key: b.brand,
        description: `مقارنة أسعار منتجات ${b.brand} بين المتاجر السعودية الكبرى، محدثة يومياً مع روابط الشراء المباشرة وأفضل التوفيرات.`,
        imageUrl: b.imageUrl,
        productsCount: b.productsCount,
        subjectName: b.brand,
      })
    ),
  ];
}

export async function findArticle(slug: string): Promise<BlogArticle | null> {
  const all = await listArticles();
  return all.find((a) => a.slug === slug) ?? null;
}
