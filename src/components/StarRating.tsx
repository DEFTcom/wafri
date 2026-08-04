"use client";

import { useState, useTransition } from "react";
import { rateProductAction } from "@/app/product/actions";

export function StarRating({
  productId,
  slug,
  average,
  count,
  myRating,
  myComment,
  myCommentStatus,
}: {
  productId: number;
  slug: string;
  average: number;
  count: number;
  myRating: number | null;
  myComment: string | null;
  myCommentStatus: "pending" | "approved" | "rejected" | null;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [voted, setVoted] = useState(myRating);
  const [justPopped, setJustPopped] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [commentSent, setCommentSent] = useState(Boolean(myComment));
  const [commentStatus, setCommentStatus] = useState(myCommentStatus);
  const [pending, startTransition] = useTransition();

  const vote = (rating: number, commentText?: string) => {
    const fd = new FormData();
    fd.set("product_id", String(productId));
    fd.set("rating", String(rating));
    fd.set("slug", slug);
    if (commentText) fd.set("comment", commentText);
    startTransition(() => {
      rateProductAction(fd);
    });
  };

  const handleStarClick = (n: number) => {
    setVoted(n);
    setJustPopped(n);
    setTimeout(() => setJustPopped(null), 450);
    vote(n);
  };

  const submitComment = () => {
    if (!voted || !comment.trim()) return;
    vote(voted, comment.trim());
    setCommentSent(true);
    setCommentStatus("pending");
  };

  const display = hovered ?? voted ?? Math.round(average);

  return (
    <div className="rounded-3xl bg-gradient-to-br from-teal-900 to-teal-700 text-white p-5 sm:p-6 mb-5 overflow-hidden relative">
      <div
        className="blob w-40 h-40 bg-gold-400/30 -top-10 -end-10"
        aria-hidden
      />
      <div className="relative">
        <h2 className="font-heading text-lg sm:text-xl font-bold mb-1">
          {voted ? "شكراً على تقييمك! 💚" : "جربتيه؟ قيّمي تجربتك معه"}
        </h2>
        <p className="text-sm text-white/70 mb-4">
          {voted
            ? "رأيك يساعد آلاف الزائرات يقررن بثقة أكثر."
            : "تقييمك بثوانٍ يفيد غيرك من الزائرات يخترن صح — بدون تسجيل."}
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex" dir="ltr" onMouseLeave={() => setHovered(null)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                disabled={pending}
                onMouseEnter={() => setHovered(n)}
                onClick={() => handleStarClick(n)}
                aria-label={`قيّمي المنتج ${n} من ٥ نجوم`}
                className={`text-3xl sm:text-4xl leading-none px-0.5 transition-transform hover:scale-125 disabled:opacity-60 ${justPopped === n ? "star-pop" : ""}`}
              >
                <span className={n <= display ? "text-gold-400 drop-shadow-[0_0_6px_rgba(217,164,65,0.5)]" : "text-white/25"}>
                  ★
                </span>
              </button>
            ))}
          </div>
          <span className="text-sm text-white/80">
            {count > 0
              ? `${average.toFixed(1)} من ٥ (${count} ${count === 1 ? "تقييم" : "تقييمات"})`
              : "كوني أول من يقيّم هالمنتج"}
          </span>
        </div>

        {voted && !commentSent && (
          <div className="reveal-down mt-4 space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="شاركي التفاصيل — ليش عجبك أو ما عجبك؟ (اختياري)"
              rows={2}
              className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-gold-400 transition-colors resize-none"
            />
            <button
              type="button"
              onClick={submitComment}
              disabled={!comment.trim() || pending}
              className="rounded-xl bg-gold-400 text-ink px-5 py-2 text-sm font-semibold hover:brightness-95 transition-all disabled:opacity-40"
            >
              ✎ انشري تعليقك
            </button>
          </div>
        )}

        {voted && commentSent && commentStatus === "approved" && (
          <p className="reveal-down mt-3 text-xs text-white/70">
            ✓ تعليقك منشور — شكراً لمشاركتك رأيك مع الزائرات الثانيات.
          </p>
        )}
        {voted && commentSent && commentStatus !== "approved" && (
          <p className="reveal-down mt-3 text-xs text-white/60">
            📝 تعليقك بانتظار مراجعة سريعة قبل ما يظهر للزائرات — شكراً لمشاركتك.
          </p>
        )}
      </div>
    </div>
  );
}
