import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ── Enums ────────────────────────────────────────────────────────────────

export const platformEnum = pgEnum("platform", ["salla", "zid", "custom"]);
export const affiliateStatusEnum = pgEnum("affiliate_status", [
  "none",
  "pending",
  "active",
]);
export const linkModeEnum = pgEnum("link_mode", ["auto", "manual"]);
export const offerScrapeStatusEnum = pgEnum("offer_scrape_status", [
  "ok",
  "failed",
  "not_applicable",
]);
export const runStatusEnum = pgEnum("run_status", [
  "success",
  "partial",
  "failed",
]);
export const matchStatusEnum = pgEnum("match_status", [
  "pending",
  "approved",
  "rejected",
]);
export const discoverySourceEnum = pgEnum("discovery_source", [
  "bestseller",
  "trending",
  "top_rated",
]);
export const discoveryStatusEnum = pgEnum("discovery_status", [
  "pending",
  "approved",
  "rejected",
]);

// ── الجداول ──────────────────────────────────────────────────────────────

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  baseDomain: text("base_domain").notNull(),
  platform: platformEnum("platform").notNull().default("custom"),
  logoUrl: text("logo_url"),
  affiliateStatus: affiliateStatusEnum("affiliate_status")
    .notNull()
    .default("none"),
  affiliateId: text("affiliate_id"),
  affiliateLinkTemplate: text("affiliate_link_template"),
  scraperConfig: jsonb("scraper_config").notNull().default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  // رابط وصفي للسيو — يتولد تلقائياً من الاسم والحجم عند الإنشاء
  slug: text("slug").unique(),
  brand: text("brand").notNull().default(""),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  sizeVariant: text("size_variant"),
  imageUrl: text("image_url"),
  // تجاوزات السيو — فارغة تعني: استخدم العنوان/الوصف المولّد تلقائياً
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  noindex: boolean("noindex").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storeOffers = pgTable("store_offers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id),
  productUrl: text("product_url").notNull(),
  rawTitle: text("raw_title").notNull().default(""),
  currentPrice: numeric("current_price", { precision: 10, scale: 2 }),
  isAvailable: boolean("is_available").notNull().default(true),
  linkMode: linkModeEnum("link_mode").notNull().default("auto"),
  couponCode: text("coupon_code"),
  couponDiscountPercent: numeric("coupon_discount_percent"),
  couponExpiresAt: date("coupon_expires_at"),
  trackingParam: text("tracking_param"),
  lastScrapedAt: timestamp("last_scraped_at", { withTimezone: true }),
  lastScrapeStatus: offerScrapeStatusEnum("last_scrape_status"),
  // نص الخطأ الفعلي لآخر محاولة سحب فاشلة — يُعرض بلوحة الإدارة مع رابط
  // تصحيح مباشر، بدل ما يُدفن بسجل نصي طويل بجدول scrape_runs
  lastScrapeError: text("last_scrape_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const priceHistory = pgTable("price_history", {
  id: serial("id").primaryKey(),
  storeOfferId: integer("store_offer_id")
    .notNull()
    .references(() => storeOffers.id),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  isAvailable: boolean("is_available").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const matchQueue = pgTable("match_queue", {
  id: serial("id").primaryKey(),
  candidateAOfferId: integer("candidate_a_offer_id")
    .notNull()
    .references(() => storeOffers.id),
  candidateBOfferId: integer("candidate_b_offer_id")
    .notNull()
    .references(() => storeOffers.id),
  confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }),
  status: matchStatusEnum("status").notNull().default("pending"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

export const searchLogs = pgTable("search_logs", {
  id: serial("id").primaryKey(),
  queryText: text("query_text").notNull(),
  resultsCount: integer("results_count").notNull(),
  searchedAt: timestamp("searched_at", { withTimezone: true }).notNull().defaultNow(),
  sessionId: text("session_id").notNull(),
});

export const scrapeRuns = pgTable("scrape_runs", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  productsAttempted: integer("products_attempted").notNull().default(0),
  productsSuccess: integer("products_success").notNull().default(0),
  productsFailed: integer("products_failed").notNull().default(0),
  status: runStatusEnum("status"),
  errorLog: text("error_log"),
});

// منتجات اكتشفها الزحف الهجين — تحتاج موافقة قبل النشر
export const discoveryQueue = pgTable("discovery_queue", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id")
    .notNull()
    .references(() => stores.id),
  rawTitle: text("raw_title").notNull(),
  productUrl: text("product_url").notNull().unique(),
  price: numeric("price", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  discoverySource: discoverySourceEnum("discovery_source").notNull(),
  status: discoveryStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
});

// نقرات "اشترِ الآن" — لتحليلات الأكثر نقراً (بدون بيانات شخصية)
export const clickLogs = pgTable("click_logs", {
  id: serial("id").primaryKey(),
  storeOfferId: integer("store_offer_id")
    .notNull()
    .references(() => storeOffers.id),
  clickedAt: timestamp("clicked_at", { withTimezone: true }).notNull().defaultNow(),
  sessionId: text("session_id"),
});

// تجاوزات سيو لمقالات المدونة المولّدة تلقائياً (فئة/ماركة) — مربوطة بالـ slug
// لأن المقالات نفسها لا تُخزَّن كصفوف، بل تُشتق من categories/products عند الطلب
export const articleSeo = pgTable("article_seo", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  introOverride: text("intro_override"),
  noindex: boolean("noindex").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// إعدادات السيو العامة للموقع — صف واحد فقط (id = 1)
export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  defaultMetaTitle: text("default_meta_title"),
  defaultMetaDescription: text("default_meta_description"),
  googleSiteVerification: text("google_site_verification"),
  bingSiteVerification: text("bing_site_verification"),
  googleAnalyticsId: text("google_analytics_id"),
  organizationName: text("organization_name"),
  organizationLogoUrl: text("organization_logo_url"),
  twitterHandle: text("twitter_handle"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
