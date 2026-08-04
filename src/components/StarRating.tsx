"use client";

import { useState, useTransition } from "react";
import { rateProductAction } from "@/app/product/actions";

export function StarRating({
  productId,
  slug,
  average,
  count,
  myRating,
}: {
  productId: number;
  slug: string;
  average: number;
  count: number;
  myRating: number | null;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [voted, setVoted] = useState(myRating);
  const [pending, startTransition] = useTransition();

  const submit = (rating: number) => {
    setVoted(rating);
    const fd = new FormData();
    fd.set("product_id", String(productId));
    fd.set("rating", String(rating));
    fd.set("slug", slug);
    startTransition(() => {
      rateProductAction(fd);
    });
  };

  const display = hovered ?? voted ?? Math.round(average);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex" dir="ltr" onMouseLeave={() => setHovered(null)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={pending}
            onMouseEnter={() => setHovered(n)}
            onClick={() => submit(n)}
            aria-label={`قيّمي المنتج ${n} من ٥ نجوم`}
            className="text-xl leading-none px-0.5 disabled:opacity-60"
          >
            <span className={n <= display ? "text-gold-400" : "text-ink/20"}>★</span>
          </button>
        ))}
      </div>
      <span className="text-xs text-ink/50">
        {voted && count === 0
          ? "شكراً على تقييمك!"
          : count > 0
            ? `${average.toFixed(1)} من ٥ (${count} ${count === 1 ? "تقييم" : "تقييمات"})`
            : "كوني أول من يقيّم هالمنتج"}
      </span>
    </div>
  );
}
