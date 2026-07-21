import { ProductCard } from "./ProductCard";
import type { ProductWithPricing } from "@/lib/queries";

// صف منتجات أفقي متحرك — 2.5 بطاقة بالجوال مع سحب سلس
export function ProductCarousel({ products }: { products: ProductWithPricing[] }) {
  return (
    <div className="carousel -mx-4 px-4" dir="rtl">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
