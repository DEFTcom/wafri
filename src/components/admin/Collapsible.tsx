"use client";

import { useState } from "react";

// بطاقة قابلة للطي — تُفتح بضغطة على الرأس بدل ما تكون مفتوحة دائماً
export function Collapsible({
  title,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-3xl bg-white border border-teal-700/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-6 text-start hover:bg-cream/50 transition-colors"
      >
        <span className="text-2xl" aria-hidden>{icon}</span>
        <h2 className="text-xl font-bold flex-1">{title}</h2>
        <span
          className="text-rose-600 text-xl transition-transform duration-300"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
          aria-hidden
        >
          ←
        </span>
      </button>
      <div
        className="grid transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </section>
  );
}
