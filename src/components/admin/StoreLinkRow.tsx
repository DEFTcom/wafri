"use client";

import { useState } from "react";

// صف رابط متجر بنموذج المنتج — زر "ابحث" يفتح بحث Google المحصور بموقع المتجر
// (site:domain.com) في تبويب جديد، لأنه الأسلوب الوحيد المضمون بغض النظر عن
// تقنية الموقع (بعضها SPA لا يعرض نتائج بحث داخلية في HTML الأساسي).
//
// السعر: افتراضياً «تلقائي» — يُسحب بـ npm run scrape ولا نلمسه هنا. لو
// فعّلتِ «سعر يدوي» نجمّد السعر المُدخل (link_mode = manual) والسحب يتجاهله.
type Props = {
  storeId: number;
  storeName: string;
  storeDomain: string;
  defaultUrl?: string;
  defaultCoupon?: string;
  defaultPrice?: string | null;
  defaultManual?: boolean;
};

export function StoreLinkRow({
  storeId,
  storeName,
  storeDomain,
  defaultUrl = "",
  defaultCoupon = "",
  defaultPrice = "",
  defaultManual = false,
}: Props) {
  const [manual, setManual] = useState(defaultManual);
  const inputCls =
    "w-full rounded-xl border border-teal-700/20 px-3 py-2.5 text-sm outline-none focus:border-rose-600 transition-colors";

  const search = () => {
    const form = document.getElementById("product-form") as HTMLFormElement | null;
    const name = (form?.elements.namedItem("name_ar") as HTMLInputElement | null)?.value.trim();
    if (!name) {
      alert("اكتبي اسم المنتج أولاً بالأعلى");
      return;
    }
    const q = encodeURIComponent(`site:${storeDomain} ${name}`);
    window.open(`https://www.google.com/search?q=${q}`, "_blank", "noopener");
  };

  return (
    <div className="rounded-xl border border-teal-700/10 p-2.5 space-y-2">
      <div className="grid grid-cols-[8rem_1fr_auto] gap-2 items-center">
        <span className="text-sm font-semibold truncate">{storeName}</span>
        <input
          name={`url_${storeId}`}
          defaultValue={defaultUrl}
          placeholder={`رابط المنتج في ${storeName}`}
          dir="ltr"
          className={inputCls}
        />
        <button
          type="button"
          onClick={search}
          title={`ابحثي عن المنتج في ${storeName} عبر Google`}
          className="rounded-xl bg-teal-700/10 text-teal-700 px-3 py-2.5 text-sm font-semibold hover:bg-teal-700/20 transition-colors whitespace-nowrap"
        >
          🔍 ابحث
        </button>
      </div>
      <div className="grid grid-cols-[8rem_1fr_1fr] gap-2 items-center">
        <label className="flex items-center gap-1.5 text-xs text-ink/60 cursor-pointer select-none">
          <input
            type="checkbox"
            name={`manual_${storeId}`}
            checked={manual}
            onChange={(e) => setManual(e.target.checked)}
            className="accent-rose-600"
          />
          سعر يدوي
        </label>
        <input
          name={`price_${storeId}`}
          type="number"
          step="0.01"
          min="0"
          defaultValue={defaultPrice ?? ""}
          disabled={!manual}
          placeholder={manual ? "السعر بالريال" : "يُسحب تلقائياً"}
          dir="ltr"
          className={`${inputCls} disabled:bg-cream disabled:text-ink/30`}
        />
        <input
          name={`coupon_${storeId}`}
          defaultValue={defaultCoupon}
          placeholder="كوبون"
          dir="ltr"
          className={inputCls}
        />
      </div>
    </div>
  );
}
