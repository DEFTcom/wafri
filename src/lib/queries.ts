import { and, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import {
  categories,
  db,
  priceHistory,
  products,
  storeOffers,
  stores,
} from "../db";

export type ProductWithPricing = {
  id: number;
  slug: string | null;
  nameAr: string;
  brand: string;
  sizeVariant: string | null;
  imageUrl: string | null;
  cheapestPrice: string | null;
  offersCount: number;
  savings: string | null; // فرق أغلى وأرخص سعر — لشارة "وفر X ر.س"
};

const pricingSelect = {
  id: products.id,
  slug: products.slug,
  nameAr: products.nameAr,
  brand: products.brand,
  sizeVariant: products.sizeVariant,
  imageUrl: products.imageUrl,
  cheapestPrice: sql<string | null>`min(${storeOffers.currentPrice})`,
  offersCount: sql<number>`count(${storeOffers.id})::int`,
  savings: sql<string | null>`nullif(max(${storeOffers.currentPrice}) - min(${storeOffers.currentPrice}), 0)`,
};

const availableOffers = and(
  eq(storeOffers.isAvailable, true),
  sql`${storeOffers.currentPrice} is not null`
);

// المنتجات الأكثر توفيراً — تظهر بالرئيسية مع شارة "وفر X ر.س"
export async function getTopSavers(limit = 8): Promise<ProductWithPricing[]> {
  return db
    .select(pricingSelect)
    .from(products)
    .innerJoin(
      storeOffers,
      and(eq(storeOffers.productId, products.id), availableOffers)
    )
    .groupBy(products.id)
    .having(
      sql`count(${storeOffers.id}) >= 2 and max(${storeOffers.currentPrice}) > min(${storeOffers.currentPrice})`
    )
    .orderBy(desc(sql`max(${storeOffers.currentPrice}) - min(${storeOffers.currentPrice})`))
    .limit(limit);
}

export async function getLatestProducts(limit = 8): Promise<ProductWithPricing[]> {
  return db
    .select(pricingSelect)
    .from(products)
    .innerJoin(
      storeOffers,
      and(eq(storeOffers.productId, products.id), availableOffers)
    )
    .groupBy(products.id)
    .orderBy(desc(products.id))
    .limit(limit);
}

export async function getCategoryProducts(
  slug: string,
  opts: { brand?: string; sort?: "cheapest" | "newest" } = {}
): Promise<{ category: { nameAr: string; slug: string } | null; items: ProductWithPricing[]; brands: string[] }> {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug));
  if (!category) return { category: null, items: [], brands: [] };

  const conditions = [eq(products.categoryId, category.id)];
  if (opts.brand) conditions.push(eq(products.brand, opts.brand));

  const items = await db
    .select(pricingSelect)
    .from(products)
    .innerJoin(
      storeOffers,
      and(eq(storeOffers.productId, products.id), availableOffers)
    )
    .where(and(...conditions))
    .groupBy(products.id)
    .orderBy(
      opts.sort === "cheapest"
        ? sql`min(${storeOffers.currentPrice}) asc`
        : desc(products.id)
    );

  const brands = (
    await db
      .selectDistinct({ brand: products.brand })
      .from(products)
      .where(and(eq(products.categoryId, category.id), sql`${products.brand} <> ''`))
  ).map((b) => b.brand);

  return { category, items, brands };
}

export async function searchProducts(query: string): Promise<ProductWithPricing[]> {
  const q = `%${query.trim()}%`;
  return db
    .select(pricingSelect)
    .from(products)
    .innerJoin(
      storeOffers,
      and(eq(storeOffers.productId, products.id), availableOffers)
    )
    .where(
      or(
        ilike(products.nameAr, q),
        ilike(products.brand, q),
        ilike(storeOffers.rawTitle, q)
      )
    )
    .groupBy(products.id)
    .limit(40);
}

// صفحة المنتج: كل العروض مرتبة بالسعر + بيانات المتجر لبناء الرابط الخارجي
// تقبل الرابط الوصفي أو الرقم (للروابط القديمة)
export async function getProductDetail(idOrSlug: string) {
  const isNumeric = /^\d+$/.test(idOrSlug);
  const [product] = await db
    .select()
    .from(products)
    .where(
      isNumeric ? eq(products.id, Number(idOrSlug)) : eq(products.slug, idOrSlug)
    );
  if (!product) return null;
  const productId = product.id;

  const [category] = await db
    .select({ nameAr: categories.nameAr, slug: categories.slug })
    .from(categories)
    .where(eq(categories.id, product.categoryId));

  const offers = await db
    .select({
      id: storeOffers.id,
      currentPrice: storeOffers.currentPrice,
      isAvailable: storeOffers.isAvailable,
      couponCode: storeOffers.couponCode,
      couponDiscountPercent: storeOffers.couponDiscountPercent,
      couponExpiresAt: storeOffers.couponExpiresAt,
      storeName: stores.nameAr,
      storeLogo: stores.logoUrl,
    })
    .from(storeOffers)
    .innerJoin(stores, eq(stores.id, storeOffers.storeId))
    .where(eq(storeOffers.productId, productId))
    .orderBy(sql`${storeOffers.currentPrice} asc nulls last`);

  return { product, offers, category };
}

// تاريخ السعر (أرخص سعر يومي عبر كل المتاجر) — آخر ٩٠ يوماً
export async function getPriceHistory(productId: number) {
  return db
    .select({
      day: sql<string>`date_trunc('day', ${priceHistory.recordedAt})::date`,
      minPrice: sql<string>`min(${priceHistory.price})`,
    })
    .from(priceHistory)
    .innerJoin(storeOffers, eq(storeOffers.id, priceHistory.storeOfferId))
    .where(
      and(
        eq(storeOffers.productId, productId),
        gte(priceHistory.recordedAt, sql`now() - interval '90 days'`)
      )
    )
    .groupBy(sql`1`)
    .orderBy(sql`1`);
}

export async function getActiveStores() {
  return db.select().from(stores).where(eq(stores.isActive, true));
}

// الماركات مع عدد المنتجات وصورة تمثيلية لكل ماركة
export async function getBrandsWithCounts() {
  return db
    .select({
      brand: products.brand,
      productsCount: sql<number>`count(*)::int`,
      imageUrl: sql<string | null>`min(${products.imageUrl}) filter (where ${products.imageUrl} is not null)`,
    })
    .from(products)
    .where(sql`${products.brand} <> ''`)
    .groupBy(products.brand)
    .orderBy(desc(sql`count(*)`));
}

export async function getBrandProducts(brand: string): Promise<ProductWithPricing[]> {
  return db
    .select(pricingSelect)
    .from(products)
    .innerJoin(
      storeOffers,
      and(eq(storeOffers.productId, products.id), availableOffers)
    )
    .where(eq(products.brand, brand))
    .groupBy(products.id)
    .orderBy(sql`min(${storeOffers.currentPrice}) asc`);
}

// بطاقات الأقسام بالرئيسية مع عدد منتجات كل قسم
export async function getCategoriesWithCounts() {
  return db
    .select({
      id: categories.id,
      nameAr: categories.nameAr,
      slug: categories.slug,
      productsCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.id);
}

// «الأكثر طلباً»: مرتبة بعدد النقرات الحقيقية، والجدد يكملون القائمة
// ملاحظة: الاستعلام الفرعي مكتوب بـ sql.raw بأسماء مؤهلة — درزل يُسقط اسم الجدول
// عن الأعمدة المُدرجة داخل استعلام فرعي مترابط فيرتبط العمود الخطأ
const clicksSubquery = sql.raw(
  `(select count(*) from click_logs cl join store_offers so2 on so2.id = cl.store_offer_id where so2.product_id = "products"."id")`
);

export async function getMostWanted(limit = 10): Promise<ProductWithPricing[]> {
  return db
    .select(pricingSelect)
    .from(products)
    .innerJoin(
      storeOffers,
      and(eq(storeOffers.productId, products.id), availableOffers)
    )
    .groupBy(products.id)
    .orderBy(desc(clicksSubquery), desc(products.id))
    .limit(limit);
}

// أرقام حية لقسم الإحصاءات بالرئيسية
export async function getSiteStats() {
  const [row] = await db
    .select({
      productsCount: sql<number>`(select count(*) from products)::int`,
      storesCount: sql<number>`(select count(*) from stores where is_active)::int`,
      pricesTracked: sql<number>`(select count(*) from price_history)::int`,
      topSaving: sql<string | null>`(
        select max(mx - mn) from (
          select max(current_price) mx, min(current_price) mn
          from store_offers where is_available and current_price is not null
          group by product_id having count(*) >= 2
        ) t
      )`,
    })
    .from(sql`(select 1) as one`);
  return row;
}
