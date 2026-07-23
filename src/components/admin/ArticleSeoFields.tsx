"use client";

import { useState } from "react";

// عنوان/وصف سيو مخصص لمقال المدونة التلقائي + زر توليد ذكي (مجاني، بدون AI)
// يعبّي الحقلين بصياغة مبنية على عدد المنتجات والسنة الحالية.
type Props = {
  defaultMetaTitle?: string | null;
  defaultMetaDescription?: string | null;
  smartTitle: string;
  smartDescription: string;
  autoTitlePlaceholder: string;
  inputCls: string;
};

export function ArticleSeoFields({
  defaultMetaTitle,
  defaultMetaDescription,
  smartTitle,
  smartDescription,
  autoTitlePlaceholder,
  inputCls,
}: Props) {
  const [title, setTitle] = useState(defaultMetaTitle ?? "");
  const [description, setDescription] = useState(defaultMetaDescription ?? "");

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setTitle(smartTitle);
            setDescription(smartDescription);
          }}
          title="يعبّي العنوان والوصف تلقائياً بصياغة سيو حديثة (مجاني، بدون AI)"
          className="rounded-lg bg-gold-400/20 text-ink px-3 py-1.5 text-xs font-semibold hover:bg-gold-400/30 transition-colors"
        >
          ✨ توليد سيو ذكي
        </button>
      </div>
      <input
        name="meta_title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`عنوان سيو مخصص (تلقائياً: ${autoTitlePlaceholder})`}
        className={inputCls}
      />
      <textarea
        name="meta_description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="وصف سيو مخصص — اتركيه فارغاً لاستخدام الوصف التلقائي"
        rows={2}
        className={`${inputCls} resize-none`}
      />
    </div>
  );
}
