// نتيجة سحب صفحة منتج واحدة من متجر
export type ScrapedProduct = {
  title: string;
  price: string | null; // numeric كنص — لا float
  available: boolean;
  imageUrl: string | null;
};

// منتج اكتشفه الزحف من صفحات الأشهر/الأكثر مبيعاً
export type DiscoveredProduct = {
  rawTitle: string;
  productUrl: string;
  price: string | null;
  imageUrl: string | null;
};

// إعدادات السحب المخزنة في stores.scraper_config (jsonb)
export type ScraperConfig = {
  // محددات CSS احتياطية إذا ما توفر JSON-LD بالصفحة
  titleSelector?: string;
  priceSelector?: string;
  imageSelector?: string;
  outOfStockSelector?: string; // وجود العنصر يعني غير متوفر
  // صفحات الاكتشاف (الأشهر/الأكثر مبيعاً) ومحدداتها
  discoveryUrls?: string[];
  discoveryItemSelector?: string;
  discoveryTitleSelector?: string;
  discoveryPriceSelector?: string;
  // تأخير بين الطلبات بالمللي ثانية (افتراضي 2500)
  requestDelayMs?: number;
};

export interface StoreScraper {
  scrapeProduct(url: string, config: ScraperConfig): Promise<ScrapedProduct>;
  discoverProducts(config: ScraperConfig): Promise<DiscoveredProduct[]>;
}
