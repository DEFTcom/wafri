import { sql } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { categories, db, products } from "@/db";
import { listArticles } from "@/lib/blog";
import { getBrandsWithCounts } from "@/lib/queries";
import { getArticleSeoMap } from "@/lib/seo";
import { makeSlug } from "@/lib/slug";

const BASE = process.env.SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [allProducts, allCategories, articles, brands, articleOverrides] = await Promise.all([
    db
      .select({ id: products.id, slug: products.slug })
      .from(products)
      .where(sql`not ${products.noindex}`),
    db.select({ slug: categories.slug }).from(categories),
    listArticles(),
    getBrandsWithCounts(),
    getArticleSeoMap(),
  ]);
  const publishedArticles = articles.filter((a) => !articleOverrides.get(a.slug)?.noindex);

  return [
    { url: BASE, changeFrequency: "daily", priority: 1 },
    { url: `${BASE}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/brands`, changeFrequency: "daily", priority: 0.8 },
    ...brands.map((b) => ({
      url: `${BASE}/brand/${encodeURIComponent(makeSlug(b.brand))}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...allCategories.map((c) => ({
      url: `${BASE}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...publishedArticles.map((a) => ({
      url: `${BASE}/blog/${encodeURIComponent(a.slug)}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...allProducts.map((p) => ({
      url: `${BASE}/product/${p.slug ? encodeURIComponent(p.slug) : p.id}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
