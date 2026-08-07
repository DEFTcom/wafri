"use client";

import Link from "next/link";
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

export function HeroCardSwap({ deals }: { deals: HeroDeal[] }) {
  if (deals.length === 0) return null;

  return (
    <div className="relative h-[300px] sm:h-[380px] lg:h-[440px] w-full overflow-hidden">
      <CardSwap width={230} height={290} cardDistance={46} verticalDistance={38} delay={1800} pauseOnHover skewAmount={5}>
        {deals.map((deal) => (
          <Card
            key={deal.id}
            style={{
              background: "#ffffff",
              border: "1px solid rgba(18,51,47,0.08)",
              boxShadow: "0 20px 45px rgba(18,51,47,0.35)",
            }}
            className="!rounded-3xl overflow-hidden"
          >
            <Link href={`/product/${deal.slug ?? deal.id}`} className="flex flex-col h-full text-ink">
              <div className="relative flex-1 bg-cream">
                {deal.imageUrl ? (
                  <SafeImage
                    src={deal.imageUrl}
                    alt={deal.nameAr}
                    fill
                    sizes="260px"
                    className="object-contain p-6"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-teal-700/30 text-5xl">
                    ✦
                  </div>
                )}
                <span className="absolute top-3 start-3 rounded-full bg-save-600 text-white text-xs font-bold px-3 py-1">
                  وفّري <Price value={deal.savings} decimals={0} />
                </span>
              </div>
              <div className="p-4 border-t border-teal-700/10">
                <p className="text-xs font-semibold line-clamp-1 mb-1.5">{deal.nameAr}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-teal-700">
                    <Price value={deal.cheapestPrice} />
                  </span>
                  <span className="text-xs text-ink/40 line-through">
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
