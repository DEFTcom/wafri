import Link from "next/link";
import type { ProductWithPricing } from "@/lib/queries";
import { Price, Riyal } from "./Riyal";
import { SafeImage } from "./SafeImage";

export function ProductCard({ product }: { product: ProductWithPricing }) {
  return (
    <Link
      href={`/product/${product.slug ?? product.id}`}
      className="card-hover group relative flex flex-col rounded-2xl bg-white border border-teal-700/10 p-4 shadow-sm"
    >
      {product.savings && (
        <span className="absolute top-3 start-3 z-10 rounded-full bg-save-600 text-white text-xs font-bold px-3 py-1 inline-flex items-center gap-1">
          وفر {Number(product.savings).toFixed(0)} <Riyal />
        </span>
      )}
      <div className="relative aspect-square rounded-xl bg-cream overflow-hidden mb-3">
        {product.imageUrl ? (
          <SafeImage
            src={product.imageUrl}
            alt={product.nameAr}
            fill
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 47vw"
            className="object-contain group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-teal-700/30 text-5xl">
            ✦
          </div>
        )}
      </div>
      {product.brand && (
        <span className="text-xs text-teal-700/70">{product.brand}</span>
      )}
      <h3 className="font-body font-semibold text-sm leading-6 line-clamp-2">
        {product.nameAr}
        {product.sizeVariant ? ` — ${product.sizeVariant}` : ""}
      </h3>
      <div className="mt-auto pt-3 flex items-baseline justify-between">
        <div>
          <span className="text-xs text-ink/60 block">يبدأ من</span>
          <span className="text-lg font-bold text-teal-700">
            {product.cheapestPrice ? <Price value={product.cheapestPrice} /> : "—"}
          </span>
        </div>
        <span className="text-xs text-ink/60">
          {product.offersCount > 1
            ? `${product.offersCount} متاجر`
            : "متجر واحد"}
        </span>
      </div>
    </Link>
  );
}
