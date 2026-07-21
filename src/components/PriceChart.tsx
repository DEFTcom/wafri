import { Price } from "./Riyal";

// رسم SVG بسيط لتاريخ السعر — يُعرض فقط عند توفر نقطتي بيانات مختلفتين فأكثر
type Point = { day: string; minPrice: string };

export function PriceChart({ points }: { points: Point[] }) {
  const distinct = new Set(points.map((p) => p.minPrice));
  if (points.length < 2 || distinct.size < 2) return null;

  const w = 640;
  const h = 200;
  const pad = 36;
  const prices = points.map((p) => Number(p.minPrice));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const x = (i: number) =>
    pad + (i * (w - pad * 2)) / Math.max(points.length - 1, 1);
  const y = (price: number) => pad + ((max - price) * (h - pad * 2)) / range;
  const path = prices.map((p, i) => `${x(i)},${y(p)}`).join(" ");

  return (
    <section className="rounded-2xl bg-white border border-teal-700/10 p-5">
      <h2 className="text-lg mb-3">تاريخ أرخص سعر (آخر ٩٠ يوم)</h2>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="رسم بياني لتاريخ السعر">
        <polyline
          points={path}
          fill="none"
          stroke="#1d4e4a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {prices.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p)} r="3.5" fill="#d6455c" />
        ))}
        <text x={w - pad} y={y(prices[prices.length - 1]) - 10} textAnchor="end" fontSize="13" fill="#1c2321">
          {prices[prices.length - 1].toFixed(2)}
        </text>
        <text x={pad} y={h - 8} fontSize="11" fill="#1c232199">
          {points[0].day}
        </text>
        <text x={w - pad} y={h - 8} textAnchor="end" fontSize="11" fill="#1c232199">
          {points[points.length - 1].day}
        </text>
      </svg>
      <p className="text-xs text-ink/60 mt-2 flex items-center gap-1">
        أدنى سعر: <Price value={min} /> • أعلى سعر: <Price value={max} />
      </p>
    </section>
  );
}
