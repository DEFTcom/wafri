"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem("cookie-consent"));
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-teal-900 text-white p-4">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center gap-3 text-sm">
        <p className="flex-1">
          نستخدم ملفات تعريف ارتباط ضرورية ومعرّفات مجهولة لتحسين التجربة
          وقياس الاستخدام، وفق نظام حماية البيانات الشخصية السعودي (PDPL).
          تفاصيل أكثر في <a href="/privacy" className="underline">سياسة الخصوصية</a>.
        </p>
        <button
          onClick={() => {
            localStorage.setItem("cookie-consent", "accepted");
            setVisible(false);
          }}
          className="rounded-xl bg-rose-600 px-6 py-2 font-semibold"
        >
          موافقة
        </button>
      </div>
    </div>
  );
}
