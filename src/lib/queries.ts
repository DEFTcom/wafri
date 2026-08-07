import { and, desc, eq, gte, ilike, or, sql } from "drizzle-orm";
import {
  categories,
  db,
  priceHistory,
  productRatings,
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
  opts: { brand?: string; sort?: "cheapest" | "newest"; store?: number } = {}
): Promise<{
  category: { id: number; nameAr: string; slug: string; parentId: number | null } | null;
  items: ProductWithPricing[];
  brands: string[];
}> {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug));
  if (!category) return { category: null, items: [], brands: [] };

  // القسم الرئيسي يعرض منتجاته + منتجات أقسامه الفرعية كلها (الأقسام الفرعية
  // مجرد عرض أدق، مو تصنيف بديل يخفي المنتج عن القسم الرئيسي)
  let categoryIds = [category.id];
  if (category.parentId === null) {
    const children = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parentId, category.id));
    categoryIds = [category.id, ...children.map((c) => c.id)];
  }

  const conditions = [
    categoryIds.length > 1
      ? sql`${products.categoryId} in ${categoryIds}`
      : eq(products.categoryId, category.id),
  ];
  if (opts.brand) conditions.push(eq(products.brand, opts.brand));
  if (opts.store) {
    conditions.push(
      sql`exists (select 1 from store_offers so3 where so3.product_id = ${products.id} and so3.store_id = ${opts.store} and so3.is_available and so3.current_price is not null)`
    );
  }

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
      // أعلى سعر فعلي مسجّل لنفس العرض بآخر ٣٠ يوم — نستخدمه كـ"السعر الأصلي"
      // المشطوب، مبني على تاريخ حقيقي مو رقم مختلق
      recentHighPrice: sql<string | null>`(
        select max(ph.price) from price_history ph
        where ph.store_offer_id = ${storeOffers.id}
          and ph.recorded_at >= now() - interval '30 days'
      )`,
    })
    .from(storeOffers)
    .innerJoin(stores, eq(stores.id, storeOffers.storeId))
    .where(eq(storeOffers.productId, productId))
    .orderBy(sql`${storeOffers.currentPrice} asc nulls last`);

  return { product, offers, category };
}

// عدد منتجات كل متجر بقسم معيّن (+ أقسامه الفرعية إن كان رئيسياً) — لفلتر المتاجر
export async function getStoreCountsForCategory(categoryId: number) {
  const children = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.parentId, categoryId));
  const ids = [categoryId, ...children.map((c) => c.id)];

  return db
    .select({
      storeId: stores.id,
      storeName: stores.nameAr,
      storeLogo: stores.logoUrl,
      count: sql<number>`count(*)::int`,
    })
    .from(storeOffers)
    .innerJoin(stores, eq(stores.id, storeOffers.storeId))
    .innerJoin(products, eq(products.id, storeOffers.productId))
    .where(
      and(
        ids.length > 1 ? sql`${products.categoryId} in ${ids}` : eq(products.categoryId, categoryId),
        availableOffers
      )
    )
    .groupBy(stores.id)
    .orderBy(desc(sql`count(*)`));
}

// صفحة المتجر: كل منتجاته + عدد المرات اللي هو فيها الأرخص
export async function getStoreDetail(storeId: number) {
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId));
  if (!store) return null;

  const items = await db
    .select(pricingSelect)
    .from(products)
    .innerJoin(
      storeOffers,
      and(eq(storeOffers.productId, products.id), eq(storeOffers.storeId, storeId), availableOffers)
    )
    .groupBy(products.id)
    .orderBy(desc(products.id));

  return { store, items };
}

// المتجر الأوفر اليوم: يُحسب بعدّ كم منتج هالمتجر فيه هو الأرخص (سعر فريد بدون تعادل)
export async function getStoreOfTheDay() {
  const wins = await db.execute(sql`
    with cheapest as (
      select distinct on (so.product_id)
        so.product_id, so.store_id, so.current_price
      from store_offers so
      where so.is_available and so.current_price is not null
      order by so.product_id, so.current_price asc
    )
    select store_id, count(*)::int as wins
    from cheapest
    group by store_id
    order by wins desc
    limit 1
  `);
  const rows = Array.from(wins) as { store_id: number; wins: number }[];
  const top = rows[0];
  if (!top) return null;

  const [store] = await db.select().from(stores).where(eq(stores.id, top.store_id));
  if (!store) return null;

  // أمثلة حقيقية على منتجات فاز فيها اليوم — لعرضها بالصفحة
  const wonProducts = await db
    .select(pricingSelect)
    .from(products)
    .innerJoin(
      storeOffers,
      and(eq(storeOffers.productId, products.id), eq(storeOffers.storeId, store.id), availableOffers)
    )
    .groupBy(products.id)
    .having(sql`min(${storeOffers.currentPrice}) = (
      select min(current_price) from store_offers so2
      where so2.product_id = ${products.id} and so2.is_available and so2.current_price is not null
    )`)
    .orderBy(sql`max(${storeOffers.currentPrice}) - min(${storeOffers.currentPrice}) desc`)
    .limit(8);

  return { store, wins: top.wins, wonProducts };
}

// ملخص تقييم النجوم (متوسط + عدد الأصوات) — والصوت السابق لهذه الجلسة إن وجد
export async function getProductRatingSummary(productId: number, sessionId: string | null) {
  const [summary] = await db
    .select({
      average: sql<string | null>`avg(${productRatings.rating})`,
      count: sql<number>`count(*)::int`,
    })
    .from(productRatings)
    .where(eq(productRatings.productId, productId));

  let myRating: number | null = null;
  let myComment: string | null = null;
  let myCommentStatus: "pending" | "approved" | "rejected" | null = null;
  if (sessionId) {
    const [mine] = await db
      .select({
        rating: productRatings.rating,
        comment: productRatings.comment,
        commentStatus: productRatings.commentStatus,
      })
      .from(productRatings)
      .where(
        and(eq(productRatings.productId, productId), eq(productRatings.sessionId, sessionId))
      );
    myRating = mine?.rating ?? null;
    myComment = mine?.comment ?? null;
    myCommentStatus = mine?.commentStatus ?? null;
  }

  return {
    average: summary?.average ? Number(summary.average) : 0,
    count: summary?.count ?? 0,
    myRating,
    myComment,
    myCommentStatus,
  };
}

// التعليقات المكتوبة الموافَق عليها فقط — تُعرض بصفحة المنتج للزوار
export async function getApprovedReviews(productId: number) {
  return db
    .select({
      rating: productRatings.rating,
      comment: productRatings.comment,
      createdAt: productRatings.createdAt,
    })
    .from(productRatings)
    .where(
      and(eq(productRatings.productId, productId), eq(productRatings.commentStatus, "approved"))
    )
    .orderBy(desc(productRatings.createdAt))
    .limit(20);
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

// بطاقات الأقسام بالرئيسية مع عدد منتجات كل قسم — الأقسام الرئيسية فقط
// (بدون الأقسام الفرعية عشان القائمة الرئيسية ما تتغير)
export async function getCategoriesWithCounts() {
  return db
    .select({
      id: categories.id,
      nameAr: categories.nameAr,
      slug: categories.slug,
      // يشمل منتجات الأقسام الفرعية أيضاً — تصنيف أدق مو نقل يخفي العدد
      productsCount: sql<number>`(
        select count(*)::int from products p
        where p.category_id = ${categories.id}
           or p.category_id in (select id from categories c2 where c2.parent_id = ${categories.id})
      )`,
    })
    .from(categories)
    .where(sql`${categories.parentId} is null`)
    .orderBy(categories.id);
}

// الأقسام الفرعية لقسم معيّن — تُعرض كرقائق أعلى صفحة القسم الرئيسي
export async function getSubcategories(parentId: number) {
  return db
    .select({
      id: categories.id,
      nameAr: categories.nameAr,
      slug: categories.slug,
      productsCount: sql<number>`count(${products.id})::int`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .where(eq(categories.parentId, parentId))
    .groupBy(categories.id)
    .having(sql`count(${products.id}) > 0`)
    .orderBy(desc(sql`count(${products.id})`));
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
