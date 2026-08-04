"use server";

import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  articleSeo,
  categories,
  db,
  discoveryQueue,
  matchQueue,
  priceHistory,
  products,
  seoSettings,
  storeOffers,
  stores,
} from "@/db";
import {
  checkPassword,
  createAdminSession,
  destroyAdminSession,
  requireAdmin,
} from "@/lib/auth";
import { guessCategorySlug, parseProductLine } from "@/lib/bulk-add";
import { uniqueProductSlug } from "@/lib/slug";
import { mergeProducts } from "@/matching/run";
import { scrapeOffer } from "@/scrapers/runner";

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    redirect("/admin/login?error=1");
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

// ── المطابقة ─────────────────────────────────────────────────────────────

export async function reviewMatchAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const decision = String(formData.get("decision"));

  const [entry] = await db.select().from(matchQueue).where(eq(matchQueue.id, id));
  if (!entry || entry.status !== "pending") return;

  if (decision === "approve") {
    const [offerA] = await db
      .select()
      .from(storeOffers)
      .where(eq(storeOffers.id, entry.candidateAOfferId));
    const [offerB] = await db
      .select()
      .from(storeOffers)
      .where(eq(storeOffers.id, entry.candidateBOfferId));
    if (offerA && offerB && offerA.productId !== offerB.productId) {
      await mergeProducts(offerA.productId, offerB.productId);
    }
  }

  await db
    .update(matchQueue)
    .set({
      status: decision === "approve" ? "approved" : "rejected",
      reviewedAt: new Date(),
    })
    .where(eq(matchQueue.id, id));
  revalidatePath("/admin/matches");
}

// ── الاكتشافات ───────────────────────────────────────────────────────────

export async function reviewDiscoveryAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const decision = String(formData.get("decision"));

  const [entry] = await db
    .select()
    .from(discoveryQueue)
    .where(eq(discoveryQueue.id, id));
  if (!entry || entry.status !== "pending") return;

  if (decision === "approve") {
    // إنشاء منتج موحّد + عرض بالمتجر المكتشف — المطابقة مع باقي المتاجر تتم لاحقاً
    const categoryId = Number(formData.get("category_id")) || 1;
    const [product] = await db
      .insert(products)
      .values({
        nameAr: entry.rawTitle,
        slug: await uniqueProductSlug(entry.rawTitle),
        categoryId,
        imageUrl: entry.imageUrl,
      })
      .returning();
    await db.insert(storeOffers).values({
      productId: product.id,
      storeId: entry.storeId,
      productUrl: entry.productUrl,
      rawTitle: entry.rawTitle,
      currentPrice: entry.price,
    });
  }

  await db
    .update(discoveryQueue)
    .set({
      status: decision === "approve" ? "approved" : "rejected",
      reviewedAt: new Date(),
    })
    .where(eq(discoveryQueue.id, id));
  revalidatePath("/admin/discoveries");
}

// ── المنتجات ─────────────────────────────────────────────────────────────

// يقرأ حقول رابط/كوبون/سعر متجر واحد من نموذج المنتج. السعر اليدوي (link_mode
// = manual) يُجمَّد ولا يلمسه npm run scrape — راجع src/scrapers/runner.ts
function readOfferInput(formData: FormData, storeId: number) {
  const url = String(formData.get(`url_${storeId}`) ?? "").trim();
  if (!url) return null;
  const manual = formData.get(`manual_${storeId}`) === "on";
  const priceRaw = String(formData.get(`price_${storeId}`) ?? "").trim();
  const coupon = String(formData.get(`coupon_${storeId}`) ?? "").trim() || null;
  return {
    url,
    coupon,
    manual,
    price: manual && priceRaw ? priceRaw : null,
  };
}

export async function addProductAction(formData: FormData) {
  await requireAdmin();
  const nameAr = String(formData.get("name_ar") ?? "").trim();
  if (!nameAr) return;

  const sizeVariant = String(formData.get("size_variant") ?? "").trim() || null;
  const [product] = await db
    .insert(products)
    .values({
      nameAr,
      slug: await uniqueProductSlug(nameAr, sizeVariant),
      brand: String(formData.get("brand") ?? "").trim(),
      categoryId: Number(formData.get("category_id")) || 1,
      sizeVariant,
      imageUrl: String(formData.get("image_url") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      metaTitle: String(formData.get("meta_title") ?? "").trim() || null,
      metaDescription: String(formData.get("meta_description") ?? "").trim() || null,
      noindex: formData.get("noindex") === "on",
    })
    .returning();

  // روابط المتاجر (اختيارية لكل متجر) — url_<storeId> + coupon_<storeId> + سعر يدوي اختياري
  const allStores = await db.select().from(stores);
  const toScrape: number[] = [];
  for (const store of allStores) {
    const offer = readOfferInput(formData, store.id);
    if (!offer) continue;
    const [created] = await db
      .insert(storeOffers)
      .values({
        productId: product.id,
        storeId: store.id,
        productUrl: offer.url,
        couponCode: offer.coupon,
        linkMode: offer.manual ? "manual" : "auto",
        currentPrice: offer.price,
        ...(offer.price && {
          isAvailable: true,
          lastScrapeStatus: "ok",
          lastScrapedAt: new Date(),
        }),
      })
      .returning();
    if (!offer.manual) toScrape.push(created.id);
  }
  // نسحب السعر فوراً بدل ما ننتظر جدولة السحب اليومي — الحفظ نفسه يجيب السعر
  for (const offerId of toScrape) {
    await scrapeOffer(offerId);
  }
  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/edit`);
}

// إضافة جماعية: سطر لكل منتج، بدون أي روابط متاجر (تُضاف يدوياً بعدين) —
// عشان نضمن صفر أخطاء روابط "اشتري الآن" الخاطئة عند الإدخال بالجملة
export async function bulkAddProductsAction(formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("lines") ?? "");
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return;

  const allCategories = await db.select().from(categories);
  const categoryIdBySlug = new Map(allCategories.map((c) => [c.slug, c.id]));
  const fallbackCategoryId = allCategories[0]?.id ?? 1;

  let created = 0;
  for (const line of lines) {
    const { nameAr, brand, sizeVariant } = parseProductLine(line);
    if (!nameAr) continue;
    const categoryId = categoryIdBySlug.get(guessCategorySlug(nameAr)) ?? fallbackCategoryId;
    await db.insert(products).values({
      nameAr,
      slug: await uniqueProductSlug(nameAr, sizeVariant),
      brand,
      categoryId,
      sizeVariant,
    });
    created++;
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products?bulk_added=${created}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const offers = await db
    .select({ id: storeOffers.id })
    .from(storeOffers)
    .where(eq(storeOffers.productId, id));
  const offerIds = offers.map((o) => o.id);
  if (offerIds.length > 0) {
    await db.delete(priceHistory).where(inArray(priceHistory.storeOfferId, offerIds));
  }
  await db.delete(storeOffers).where(eq(storeOffers.productId, id));
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
}

export async function updateProductAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const nameAr = String(formData.get("name_ar") ?? "").trim();
  if (!nameAr || !id) return;

  const sizeVariant = String(formData.get("size_variant") ?? "").trim() || null;
  await db
    .update(products)
    .set({
      nameAr,
      brand: String(formData.get("brand") ?? "").trim(),
      categoryId: Number(formData.get("category_id")) || 1,
      sizeVariant,
      imageUrl: String(formData.get("image_url") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      metaTitle: String(formData.get("meta_title") ?? "").trim() || null,
      metaDescription: String(formData.get("meta_description") ?? "").trim() || null,
      noindex: formData.get("noindex") === "on",
    })
    .where(eq(products.id, id));

  // روابط المتاجر: تحديث الموجود، وإنشاء عرض جديد لأي متجر أُدخل رابطه لأول مرة
  const allStores = await db.select().from(stores);
  const existingOffers = await db
    .select()
    .from(storeOffers)
    .where(eq(storeOffers.productId, id));

  const toScrape: number[] = [];
  for (const store of allStores) {
    const offer = readOfferInput(formData, store.id);
    const existing = existingOffers.find((o) => o.storeId === store.id);
    if (!offer) {
      // الحقل فُرِّغ عمداً لمتجر له عرض موجود → نحذف العرض بدل تجاهله
      if (existing) {
        await db.delete(priceHistory).where(eq(priceHistory.storeOfferId, existing.id));
        await db.delete(storeOffers).where(eq(storeOffers.id, existing.id));
      }
      continue;
    }
    if (existing) {
      // رابط تغيّر أو ما له سعر بعد → يحتاج سحب فوري بدل انتظار الجدولة
      const urlChanged = existing.productUrl !== offer.url;
      const needsScrape = !offer.manual && (urlChanged || !existing.currentPrice);
      await db
        .update(storeOffers)
        .set({
          productUrl: offer.url,
          couponCode: offer.coupon,
          linkMode: offer.manual ? "manual" : "auto",
          // نحدّث السعر فقط لو أُدخل يدوياً — وإلا نتركه كما هو ليحدّثه السحب التلقائي
          ...(offer.price && {
            currentPrice: offer.price,
            isAvailable: true,
            lastScrapeStatus: "ok",
            lastScrapedAt: new Date(),
          }),
        })
        .where(eq(storeOffers.id, existing.id));
      if (needsScrape) toScrape.push(existing.id);
    } else {
      const [created] = await db
        .insert(storeOffers)
        .values({
          productId: id,
          storeId: store.id,
          productUrl: offer.url,
          couponCode: offer.coupon,
          linkMode: offer.manual ? "manual" : "auto",
          currentPrice: offer.price,
          ...(offer.price && {
            isAvailable: true,
            lastScrapeStatus: "ok",
            lastScrapedAt: new Date(),
          }),
        })
        .returning();
      if (!offer.manual) toScrape.push(created.id);
    }
  }
  // نسحب السعر فوراً بدل ما ننتظر جدولة السحب اليومي — الحفظ نفسه يجيب السعر
  for (const offerId of toScrape) {
    await scrapeOffer(offerId);
  }
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

// يسحب كل عروض المنتج التلقائية فوراً — زر «سحب الآن» بصفحة تعديل المنتج
export async function scrapeProductAction(formData: FormData) {
  await requireAdmin();
  const productId = Number(formData.get("product_id"));
  const offers = await db
    .select({ id: storeOffers.id })
    .from(storeOffers)
    .where(eq(storeOffers.productId, productId));
  for (const offer of offers) {
    await scrapeOffer(offer.id);
  }
  revalidatePath(`/admin/products/${productId}/edit`);
}

// إعادة محاولة عرض فاشل واحد من صفحة حالة السحب مباشرة
export async function retryOfferScrapeAction(formData: FormData) {
  await requireAdmin();
  const offerId = Number(formData.get("offer_id"));
  await scrapeOffer(offerId);
  revalidatePath("/admin");
}

// ── المتاجر ──────────────────────────────────────────────────────────────

export async function updateStoreAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db
    .update(stores)
    .set({
      affiliateStatus: String(formData.get("affiliate_status")) as
        | "none"
        | "pending"
        | "active",
      affiliateId: String(formData.get("affiliate_id") ?? "").trim() || null,
      affiliateLinkTemplate:
        String(formData.get("affiliate_link_template") ?? "").trim() || null,
      isActive: formData.get("is_active") === "on",
    })
    .where(eq(stores.id, id));
  revalidatePath("/admin/stores");
}

export async function addStoreAction(formData: FormData) {
  await requireAdmin();
  const nameAr = String(formData.get("name_ar") ?? "").trim();
  const baseDomain = String(formData.get("base_domain") ?? "").trim();
  if (!nameAr || !baseDomain) return;

  await db.insert(stores).values({
    nameAr,
    baseDomain,
    platform: String(formData.get("platform") ?? "custom") as "salla" | "zid" | "custom",
    logoUrl: String(formData.get("logo_url") ?? "").trim() || null,
  });
  revalidatePath("/admin/stores");
}

export async function deleteStoreAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const [offersCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(storeOffers)
    .where(eq(storeOffers.storeId, id));
  if (offersCount.count > 0) return; // لا نحذف متجر له عروض مربوطة — عطّليه بدل الحذف
  await db.delete(stores).where(eq(stores.id, id));
  revalidatePath("/admin/stores");
}

// ── السيو ────────────────────────────────────────────────────────────────

export async function updateSeoSettingsAction(formData: FormData) {
  await requireAdmin();
  await db
    .insert(seoSettings)
    .values({
      id: 1,
      defaultMetaTitle: String(formData.get("default_meta_title") ?? "").trim() || null,
      defaultMetaDescription:
        String(formData.get("default_meta_description") ?? "").trim() || null,
      googleSiteVerification:
        String(formData.get("google_site_verification") ?? "").trim() || null,
      bingSiteVerification: String(formData.get("bing_site_verification") ?? "").trim() || null,
      googleAnalyticsId: String(formData.get("google_analytics_id") ?? "").trim() || null,
      organizationName: String(formData.get("organization_name") ?? "").trim() || null,
      organizationLogoUrl: String(formData.get("organization_logo_url") ?? "").trim() || null,
      twitterHandle: String(formData.get("twitter_handle") ?? "").trim() || null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: seoSettings.id,
      set: {
        defaultMetaTitle: String(formData.get("default_meta_title") ?? "").trim() || null,
        defaultMetaDescription:
          String(formData.get("default_meta_description") ?? "").trim() || null,
        googleSiteVerification:
          String(formData.get("google_site_verification") ?? "").trim() || null,
        bingSiteVerification:
          String(formData.get("bing_site_verification") ?? "").trim() || null,
        googleAnalyticsId: String(formData.get("google_analytics_id") ?? "").trim() || null,
        organizationName: String(formData.get("organization_name") ?? "").trim() || null,
        organizationLogoUrl:
          String(formData.get("organization_logo_url") ?? "").trim() || null,
        twitterHandle: String(formData.get("twitter_handle") ?? "").trim() || null,
        updatedAt: new Date(),
      },
    });
  revalidatePath("/admin/seo");
  revalidatePath("/");
}

export async function upsertArticleSeoAction(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;

  const values = {
    metaTitle: String(formData.get("meta_title") ?? "").trim() || null,
    metaDescription: String(formData.get("meta_description") ?? "").trim() || null,
    introOverride: String(formData.get("intro_override") ?? "").trim() || null,
    noindex: formData.get("noindex") === "on",
    updatedAt: new Date(),
  };

  await db
    .insert(articleSeo)
    .values({ slug, ...values })
    .onConflictDoUpdate({ target: articleSeo.slug, set: values });

  revalidatePath("/admin/seo/articles");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
}
