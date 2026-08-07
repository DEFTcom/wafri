"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import CardSwap, { Card } from "@/CardSwap/CardSwap";
import { Price } from "@/components/Riyal";
import { SafeImage } from "@/components/SafeImage";

export type HeroDeal = {
  id: number;
  slug: string | null;
  nameAr: string;
  imageUrl: string | null;
  cheapestPrice: string;
  wasPrice: string;
  savings: string;
};

// أحجام أصغر ومسافات أضيق على الجوال — عشان الرزمة كاملة تضل داخل إطار
// القسم بدون ما تنقص من الحواف (بدل الاعتماد على تحجيم CSS الافتراضي
// اللي يتعارض حساباته مع التوسيط)
function subscribe(callback: () => void) {
  const mq = window.matchMedia("(min-width: 640px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function useCardSize() {
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(min-width: 640px)").matches,
    () => false
  );
  return desktop
    ? { width: 230, height: 290, cardDistance: 46, verticalDistance: 38 }
    : { width: 124, height: 150, cardDistance: 22, verticalDistance: 16 };
}

export function HeroCardSwap({ deals }: { deals: HeroDeal[] }) {
  const size = useCardSize();
  if (deals.length === 0) return null;

  return (
    <div className="relative h-[220px] sm:h-[380px] lg:h-[440px] w-full overflow-hidden">
      <CardSwap {...size} delay={1800} pauseOnHover skewAmount={5}>
        {deals.map((deal) => (
          <Card
            key={deal.id}
            style={{
              background: "#ffffff",
              border: "1px solid rgba(18,51,47,0.08)",
              boxShadow: "0 20px 45px rgba(18,51,47,0.35)",
            }}
            className="!rounded-2xl sm:!rounded-3xl overflow-hidden"
          >
            <Link href={`/product/${deal.slug ?? deal.id}`} className="flex flex-col h-full text-ink">
              <div className="relative flex-1 bg-cream">
                {deal.imageUrl ? (
                  <SafeImage
                    src={deal.imageUrl}
                    alt={deal.nameAr}
                    fill
                    sizes="230px"
                    className="object-contain p-3 sm:p-6"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-teal-700/30 text-3xl sm:text-5xl">
                    ✦
                  </div>
                )}
                <span className="absolute top-1.5 start-1.5 sm:top-3 sm:start-3 rounded-full bg-save-600 text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 whitespace-nowrap">
                  وفّري <Price value={deal.savings} decimals={0} />
                </span>
              </div>
              <div className="p-1.5 sm:p-4 border-t border-teal-700/10">
                <p className="text-[9px] sm:text-xs font-semibold line-clamp-1 mb-0.5 sm:mb-1.5">
                  {deal.nameAr}
                </p>
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <span className="text-xs sm:text-lg font-bold text-teal-700">
                    <Price value={deal.cheapestPrice} />
                  </span>
                  <span className="text-[9px] sm:text-xs text-ink/40 line-through">
                    <Price value={deal.wasPrice} />
                  </span>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </CardSwap>
    </div>
  );
}
