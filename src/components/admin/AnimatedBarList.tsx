"use client";

import { useEffect, useState } from "react";

type Row = { label: string; sub?: string; count: number };

const GRADIENTS = [
  "from-rose-600 to-rose-400",
  "from-teal-700 to-teal-500",
  "from-gold-400 to-rose-400",
];

export function AnimatedBarList({
  icon,
  title,
  rows,
  barGradient = 0,
}: {
  icon: string;
  title: string;
  rows: Row[];
  barGradient?: number;
}) {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <section className="card-hover rounded-3xl bg-white border border-teal-700/10 p-5">
      <h2 className="text-lg mb-4 flex items-center gap-2">
        <span aria-hidden>{icon}</span> {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-ink/50">لا بيانات بعد.</p>
      ) : (
        <ol className="space-y-3 text-sm">
          {rows.map((r, i) => (
            <li key={`${r.label}-${i}`} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-700/10 text-teal-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 line-clamp-1">
                  {r.label}
                  {r.sub && <span className="text-ink/50 text-xs"> — {r.sub}</span>}
                </span>
                <b className="text-rose-600 shrink-0">{r.count}</b>
              </div>
              <div className="h-1.5 rounded-full bg-cream overflow-hidden ms-7">
                <div
                  className={`h-full rounded-full bg-gradient-to-l ${GRADIENTS[barGradient % GRADIENTS.length]} transition-[width] duration-700 ease-out`}
                  style={{ width: grown ? `${(r.count / max) * 100}%` : "0%", transitionDelay: `${i * 40}ms` }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
