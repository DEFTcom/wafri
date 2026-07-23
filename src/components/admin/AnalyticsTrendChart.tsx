"use client";

import { useEffect, useId, useState } from "react";

type Series = { label: string; color: string; values: number[] };

// رسم بياني خطي (area chart) بدون أي مكتبة خارجية — SVG خام + انيميشن CSS
// لرسم الخط تدريجياً عند التحميل (stroke-dashoffset)، متوافق تماماً مع RTL.
export function AnalyticsTrendChart({
  days,
  series,
}: {
  days: string[]; // "MM/DD" جاهزة للعرض
  series: Series[];
}) {
  const uid = useId().replace(/:/g, "");
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const W = 640;
  const H = 200;
  const padX = 8;
  const padY = 12;
  const n = days.length;
  const max = Math.max(1, ...series.flatMap((s) => s.values));

  const x = (i: number) => padX + (i * (W - padX * 2)) / Math.max(1, n - 1);
  const y = (v: number) => H - padY - (v / max) * (H - padY * 2);

  const linePath = (values: number[]) =>
    values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const areaPath = (values: number[]) =>
    `${linePath(values)} L${x(values.length - 1).toFixed(1)},${H - padY} L${x(0).toFixed(1)},${H - padY} Z`;

  return (
    <div className="w-full overflow-x-auto" dir="ltr">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[480px]" style={{ height: H }}>
        <defs>
          {series.map((s, i) => (
            <linearGradient key={i} id={`${uid}-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padX}
            x2={W - padX}
            y1={H - padY - f * (H - padY * 2)}
            y2={H - padY - f * (H - padY * 2)}
            stroke="currentColor"
            className="text-ink/5"
            strokeWidth={1}
          />
        ))}

        {series.map((s, i) => (
          <path
            key={`area-${i}`}
            d={areaPath(s.values)}
            fill={`url(#${uid}-grad-${i})`}
            opacity={drawn ? 1 : 0}
            style={{ transition: "opacity 900ms ease-out" }}
          />
        ))}

        {series.map((s, i) => {
          const d = linePath(s.values);
          return (
            <path
              key={`line-${i}`}
              d={d}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={drawn ? 0 : 100}
              style={{ transition: `stroke-dashoffset 1100ms ease-out ${i * 150}ms` }}
            />
          );
        })}

        {series.map((s, i) =>
          s.values.map((v, j) => (
            <circle
              key={`pt-${i}-${j}`}
              cx={x(j)}
              cy={y(v)}
              r={2.5}
              fill={s.color}
              opacity={drawn ? 1 : 0}
              style={{ transition: `opacity 300ms ease-out ${900 + i * 150}ms` }}
            />
          ))
        )}
      </svg>
      <div className="flex justify-between text-[10px] text-ink/40 mt-1 px-2" dir="ltr">
        <span>{days[0]}</span>
        <span>{days[Math.floor(days.length / 2)]}</span>
        <span>{days[days.length - 1]}</span>
      </div>
      <div className="flex items-center gap-4 mt-2 text-xs">
        {series.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
