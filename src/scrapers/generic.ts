import * as cheerio from "cheerio";
import type {
  DiscoveredProduct,
  ScrapedProduct,
  ScraperConfig,
  StoreScraper,
} from "./types";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "ar,en;q=0.8",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(30_000),
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// يحوّل "١٢٣٫٥٠ ر.س" أو "SAR 123.50" إلى "123.50"
export function parsePrice(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const western = raw.replace(/[٠-٩]/g, (d) =>
    String("٠١٢٣٤٥٦٧٨٩".indexOf(d))
  );
  const m = western.replace(/٫/g, ".").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return m ? Number(m[0]).toFixed(2) : null;
}

type JsonLdProduct = {
  name?: string;
  image?: string | string[] | { url?: string };
  offers?: unknown;
};

function findJsonLdProduct($: cheerio.CheerioAPI): JsonLdProduct | null {
  for (const el of $('script[type="application/ld+json"]').toArray()) {
    try {
      const parsed = JSON.parse($(el).text());
      const nodes: unknown[] = Array.isArray(parsed)
        ? parsed
        : parsed["@graph"]
          ? parsed["@graph"]
          : [parsed];
      for (const node of nodes) {
        const n = node as { "@type"?: string | string[] };
        const type = Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]];
        if (type.includes("Product")) return node as JsonLdProduct;
      }
    } catch {
      // JSON غير صالح بالصفحة — نتجاوزه
    }
  }
  return null;
}

function extractOffer(offers: unknown): { price: string | null; available: boolean | null } {
  if (!offers) return { price: null, available: null };
  const offer = (Array.isArray(offers) ? offers[0] : offers) as {
    price?: string | number;
    lowPrice?: string | number;
    availability?: string;
  };
  const price = parsePrice(String(offer.price ?? offer.lowPrice ?? ""));
  const available = offer.availability
    ? /InStock|LimitedAvailability|OnlineOnly/i.test(offer.availability)
    : null;
  return { price, available };
}

export const genericScraper: StoreScraper = {
  async scrapeProduct(url, config): Promise<ScrapedProduct> {
    const $ = cheerio.load(await fetchHtml(url));

    // المصدر الأول: JSON-LD (متوفر بأغلب المتاجر لأغراض SEO)
    const ld = findJsonLdProduct($);
    const ldOffer = extractOffer(ld?.offers);

    // المصدر الثاني: محددات CSS من scraper_config
    const cssTitle = config.titleSelector
      ? $(config.titleSelector).first().text().trim()
      : "";
    const cssPrice = config.priceSelector
      ? parsePrice($(config.priceSelector).first().text())
      : null;
    const cssImage = config.imageSelector
      ? $(config.imageSelector).first().attr("src") ?? null
      : null;
    const outOfStock = config.outOfStockSelector
      ? $(config.outOfStockSelector).length > 0
      : false;

    const ogTitle = $('meta[property="og:title"]').attr("content")?.trim();
    const ogImage = $('meta[property="og:image"]').attr("content") ?? null;

    const title = ld?.name?.trim() || cssTitle || ogTitle || "";
    const price = ldOffer.price ?? cssPrice;
    if (!title || price === null) {
      throw new Error(
        `تعذر استخراج ${!title ? "العنوان" : "السعر"} من ${url}`
      );
    }

    const ldImage = Array.isArray(ld?.image)
      ? ld.image[0]
      : typeof ld?.image === "object"
        ? (ld.image as { url?: string }).url
        : ld?.image;

    return {
      title,
      price,
      available: outOfStock ? false : (ldOffer.available ?? true),
      imageUrl: (typeof ldImage === "string" ? ldImage : null) ?? cssImage ?? ogImage,
    };
  },

  async discoverProducts(config): Promise<DiscoveredProduct[]> {
    if (!config.discoveryUrls?.length || !config.discoveryItemSelector) {
      return [];
    }
    const results: DiscoveredProduct[] = [];
    for (const listUrl of config.discoveryUrls) {
      const $ = cheerio.load(await fetchHtml(listUrl));
      for (const el of $(config.discoveryItemSelector).toArray()) {
        const item = $(el);
        const link = item.is("a") ? item : item.find("a").first();
        const href = link.attr("href");
        if (!href) continue;
        const productUrl = new URL(href, listUrl).toString();
        const rawTitle = config.discoveryTitleSelector
          ? item.find(config.discoveryTitleSelector).first().text().trim()
          : link.text().trim();
        if (!rawTitle) continue;
        results.push({
          rawTitle,
          productUrl,
          price: config.discoveryPriceSelector
            ? parsePrice(item.find(config.discoveryPriceSelector).first().text())
            : null,
          imageUrl: item.find("img").first().attr("src") ?? null,
        });
      }
      await new Promise((r) => setTimeout(r, config.requestDelayMs ?? 2500));
    }
    return results;
  },
};
