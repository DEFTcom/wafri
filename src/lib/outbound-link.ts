// §٣ من مستند المتطلبات — الدالة المركزية الوحيدة لبناء رابط "اشترِ الآن".
// اليوم اللي تنعقد فيه اتفاقية عمولة: يُحدَّث صف المتجر فقط (affiliate_status
// + affiliate_link_template) والموقع كامل يتحول تلقائياً.
type StoreLike = {
  affiliateStatus: "none" | "pending" | "active";
  affiliateId: string | null;
  affiliateLinkTemplate: string | null;
};

type OfferLike = {
  productUrl: string;
  trackingParam: string | null;
};

export function buildOutboundLink(offer: OfferLike, store: StoreLike): string {
  if (store.affiliateStatus === "active" && store.affiliateLinkTemplate) {
    return store.affiliateLinkTemplate
      .replaceAll("{url}", encodeURIComponent(offer.productUrl))
      .replaceAll("{raw_url}", offer.productUrl)
      .replaceAll("{affiliate_id}", store.affiliateId ?? "")
      .replaceAll("{tracking_param}", offer.trackingParam ?? "");
  }
  return offer.productUrl;
}
