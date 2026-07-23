import { FetchDataButton } from "./FetchDataButton";
import { ImageUrlField } from "./ImageUrlField";
import { SeoFields } from "./SeoFields";
import { StoreLinkRow } from "./StoreLinkRow";

const CATEGORY_ICONS: Record<string, string> = {
  skincare: "🧴",
  "hair-care": "💇‍♀️",
  "body-care": "🧖‍♀️",
  "oral-care": "🦷",
  "lip-care": "💋",
  "eye-care": "👁️",
  "hand-care": "💅",
  "foot-care": "🦶",
  "women-care": "🌸",
  "men-care": "🪒",
  "baby-care": "👶",
};

type Category = { id: number; nameAr: string; slug: string };
type Store = { id: number; nameAr: string; baseDomain: string };

export function ProductFormFields({
  categories,
  stores,
  defaults,
  offers = {},
  seo,
}: {
  categories: Category[];
  stores: Store[];
  defaults?: {
    nameAr?: string;
    brand?: string;
    sizeVariant?: string | null;
    imageUrl?: string | null;
    categoryId?: number;
  };
  offers?: Record<
    number,
    { url: string; coupon: string | null; price: string | null; manual: boolean }
  >;
  seo?: {
    metaTitle: string | null;
    metaDescription: string | null;
    noindex: boolean;
    previewUrl: string;
    autoTitle: string;
    autoDescription: string;
    smartTitle?: string;
    smartDescription?: string;
  };
}) {
  const inputCls =
    "w-full rounded-xl border border-teal-700/20 px-3 py-2.5 text-sm outline-none focus:border-rose-600 transition-colors";

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <input
          name="name_ar"
          required
          defaultValue={defaults?.nameAr}
          placeholder="اسم المنتج الموحّد *"
          className={inputCls}
        />
        <input name="brand" defaultValue={defaults?.brand} placeholder="الماركة" className={inputCls} />
        <input
          name="size_variant"
          defaultValue={defaults?.sizeVariant ?? ""}
          placeholder="الحجم (مثال: 50ml)"
          className={inputCls}
        />
        <select name="category_id" defaultValue={defaults?.categoryId ?? categories[0]?.id} className={inputCls}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {CATEGORY_ICONS[c.slug] ?? "✨"} {c.nameAr}
            </option>
          ))}
        </select>
      </div>
      <ImageUrlField defaultValue={defaults?.imageUrl} />
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <h3 className="font-semibold text-sm text-teal-700">
          روابط المتاجر <span className="text-ink/40 font-normal">(اتركي الفارغ، أو اضغطي «ابحث» للمساعدة)</span>
        </h3>
        <FetchDataButton stores={stores} />
      </div>
      <div className="space-y-2">
        {stores.map((s) => (
          <StoreLinkRow
            key={s.id}
            storeId={s.id}
            storeName={s.nameAr}
            storeDomain={s.baseDomain}
            defaultUrl={offers[s.id]?.url}
            defaultCoupon={offers[s.id]?.coupon ?? ""}
            defaultPrice={offers[s.id]?.price}
            defaultManual={offers[s.id]?.manual ?? false}
          />
        ))}
      </div>
      <SeoFields
        defaultMetaTitle={seo?.metaTitle}
        defaultMetaDescription={seo?.metaDescription}
        defaultNoindex={seo?.noindex}
        previewUrl={seo?.previewUrl ?? "wafri.sa/product/..."}
        autoTitle={seo?.autoTitle ?? "سعر [اسم المنتج] يبدأ من [أرخص سعر] ريال"}
        autoDescription={
          seo?.autoDescription ?? "قارني سعر المنتج بين المتاجر — محدث يومياً مع الكوبونات وتاريخ الأسعار."
        }
        smartTitle={seo?.smartTitle}
        smartDescription={seo?.smartDescription}
      />
    </div>
  );
}
