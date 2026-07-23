"use client";

import { useState } from "react";

// حقول السيو لأي نموذج منتج: عنوان ووصف تجاوز (يتفوقان على المولَّد تلقائياً)
// + معاينة مباشرة تحاكي شكل نتيجة جوجل + عداد أحرف بألوان تحذيرية.
type Props = {
  defaultMetaTitle?: string | null;
  defaultMetaDescription?: string | null;
  defaultNoindex?: boolean;
  previewUrl: string;
  autoTitle: string;
  autoDescription: string;
  smartTitle?: string;
  smartDescription?: string;
};

function counterColor(len: number, min: number, max: number) {
  if (len === 0) return "text-ink/40";
  if (len < min || len > max) return "text-rose-600";
  return "text-save-600";
}

export function SeoFields({
  defaultMetaTitle,
  defaultMetaDescription,
  defaultNoindex = false,
  previewUrl,
  autoTitle,
  autoDescription,
  smartTitle,
  smartDescription,
}: Props) {
  const [title, setTitle] = useState(defaultMetaTitle ?? "");
  const [description, setDescription] = useState(defaultMetaDescription ?? "");

  const inputCls =
    "w-full rounded-xl border border-teal-700/20 px-3 py-2.5 text-sm outline-none focus:border-rose-600 transition-colors";

  const shownTitle = title.trim() || autoTitle;
  const shownDescription = description.trim() || autoDescription;

  const applySmart = () => {
    if (smartTitle) setTitle(smartTitle);
    if (smartDescription) setDescription(smartDescription);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
        <h3 className="font-semibold text-sm text-teal-700">
          السيو <span className="text-ink/40 font-normal">(اختياري — اتركيه فارغاً لاستخدام العنوان/الوصف المولّد تلقائياً)</span>
        </h3>
        {(smartTitle || smartDescription) && (
          <button
            type="button"
            onClick={applySmart}
            title="يعبّي العنوان والوصف تلقائياً بصياغة سيو حديثة مبنية على بيانات المنتج (مجاني، بدون AI)"
            className="rounded-xl bg-gold-400/20 text-ink px-4 py-2 text-sm font-semibold hover:bg-gold-400/30 transition-colors whitespace-nowrap"
          >
            ✨ توليد سيو ذكي
          </button>
        )}
      </div>

      {/* معاينة جوجل */}
      <div className="rounded-xl bg-white border border-teal-700/10 p-4" dir="ltr">
        <p className="text-xs text-[#1a0dab] truncate">{previewUrl}</p>
        <p className="text-lg text-[#1558d6] leading-6 mt-0.5 line-clamp-1">{shownTitle}</p>
        <p className="text-sm text-[#4d5156] leading-5 mt-0.5 line-clamp-2">{shownDescription}</p>
      </div>

      <div className="space-y-1">
        <input
          name="meta_title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`عنوان السيو المخصص (تلقائياً: ${autoTitle})`}
          className={inputCls}
        />
        <p className={`text-xs ${counterColor(title.trim().length, 30, 60)}`}>
          {title.trim().length} حرف {title.trim().length === 0 ? "" : "(المثالي 30–60)"}
        </p>
      </div>

      <div className="space-y-1">
        <textarea
          name="meta_description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="وصف السيو المخصص — اتركيه فارغاً لاستخدام الوصف التلقائي"
          rows={2}
          className={`${inputCls} resize-none`}
        />
        <p className={`text-xs ${counterColor(description.trim().length, 70, 160)}`}>
          {description.trim().length} حرف {description.trim().length === 0 ? "" : "(المثالي 70–160)"}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-ink/70 cursor-pointer select-none w-fit">
        <input
          type="checkbox"
          name="noindex"
          defaultChecked={defaultNoindex}
          className="accent-rose-600"
        />
        استبعاد من نتائج البحث (noindex)
      </label>
    </div>
  );
}
