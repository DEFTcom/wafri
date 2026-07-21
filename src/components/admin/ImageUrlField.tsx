"use client";

import { useState } from "react";

// حقل رابط الصورة مع معاينة حية — يمنع خطأ شائع: لصق رابط صفحة المنتج
// بالغلط بدل رابط الصورة الفعلي (الرابطان يتشابهان بالشكل لأول وهلة)
export function ImageUrlField({ defaultValue }: { defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  const inputCls =
    "w-full rounded-xl border border-teal-700/20 px-3 py-2.5 text-sm outline-none focus:border-rose-600 transition-colors";

  return (
    <div className="space-y-1.5">
      <input
        name="image_url"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setStatus("idle");
        }}
        placeholder="رابط الصورة (مو رابط صفحة المنتج)"
        dir="ltr"
        className={inputCls}
      />
      {url.trim() && (
        <div className="flex items-center gap-2">
          <div className="w-14 h-14 rounded-lg bg-cream border border-teal-700/10 overflow-hidden shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- معاينة سريعة بدون next/image (رابط غير مؤكد بعد) */}
            <img
              src={url}
              alt=""
              className="w-full h-full object-contain"
              onLoad={() => setStatus("ok")}
              onError={() => setStatus("error")}
            />
          </div>
          {status === "ok" && <span className="text-xs text-save-600 font-semibold">✓ الصورة تظهر صح</span>}
          {status === "error" && (
            <span className="text-xs text-rose-600 font-semibold">
              ⚠️ هذا الرابط ما يفتح صورة — تأكدي إنه رابط الصورة مو رابط صفحة المنتج
            </span>
          )}
        </div>
      )}
    </div>
  );
}
