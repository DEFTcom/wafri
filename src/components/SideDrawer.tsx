"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const LINKS = [
  { href: "/", label: "الرئيسية", icon: "✦" },
  { href: "/#categories", label: "أقسام العناية", icon: "🧴" },
  { href: "/brands", label: "ماركات الشركات", icon: "🏷️" },
  { href: "/#savers", label: "الأكثر توفيراً", icon: "💚" },
  { href: "/#trending", label: "الأكثر طلباً", icon: "🔥" },
  { href: "/blog", label: "دليل الأسعار", icon: "📊" },
  { href: "/privacy", label: "سياسة الخصوصية", icon: "🔒" },
  { href: "/terms", label: "شروط الاستخدام", icon: "📄" },
];

// القائمة الجانبية — تنزلق من اليمين مع خلفية معتمة
export function SideDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
        className="flex flex-col justify-center gap-1.5 w-10 h-10 rounded-xl hover:bg-white/10 items-center shrink-0"
      >
        <span className="block w-5 h-0.5 bg-current rounded" />
        <span className="block w-3.5 h-0.5 bg-current rounded" />
        <span className="block w-5 h-0.5 bg-current rounded" />
      </button>

      {mounted &&
        createPortal(
          <>
            {/* الخلفية المعتمة */}
            <div
              onClick={() => setOpen(false)}
              className={`fixed inset-0 z-50 bg-teal-900/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            />

            {/* اللوحة */}
            <aside
              className={`fixed top-0 bottom-0 start-0 z-50 w-72 bg-cream text-ink shadow-2xl transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
            >
              <div className="flex items-center justify-between p-5 border-b border-teal-700/10">
                <span className="font-heading text-2xl font-bold text-teal-900">
                  وفّري<span className="text-rose-600">.</span>
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="إغلاق"
                  className="w-9 h-9 rounded-xl hover:bg-teal-700/10 text-xl"
                >
                  ✕
                </button>
              </div>
              <nav className="p-3">
                {LINKS.map((l, i) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white transition-colors font-semibold"
                    style={{ transitionDelay: `${i * 30}ms` }}
                  >
                    <span aria-hidden>{l.icon}</span>
                    {l.label}
                  </Link>
                ))}
              </nav>
              <p className="absolute bottom-5 inset-x-5 text-xs text-ink/50 leading-6">
                وفّري — نقارن أسعار منتجات العناية من ٥ متاجر سعودية، حتى
                تدفعين أقل على نفس المنتج.
              </p>
            </aside>
          </>,
          document.body,
        )}
    </>
  );
}
