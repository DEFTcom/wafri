"use client";

import { useEffect, useState } from "react";
import { Riyal } from "./Riyal";

type ProofItem = {
  name: string;
  slug: string | null;
  id: number;
  savings: number;
  cheapest: number;
  storeName: string;
};

// أسماء وددن — تُدمج مع أرقام توفير حقيقية من قاعدة البيانات
const NAMES = [
  "هند من الرياض",
  "نورة من جدة",
  "سارة من الدمام",
  "ريم من مكة",
  "لمى من الخبر",
  "غادة من المدينة",
  "شهد من أبها",
  "دانة من الطائف",
  "أمل من بريدة",
  "جود من تبوك",
];

type Toast =
  | { kind: "saving"; item: ProofItem }
  | { kind: "person"; name: string; item: ProofItem };

// إشعارات منبثقة: رسالة توفير عامة + رسائل بأسماء عميلات — المبالغ حقيقية دائماً
export function SocialProofToasts() {
  const [items, setItems] = useState<ProofItem[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    fetch("/api/social-proof")
      .then((r) => r.json())
      .then((data: ProofItem[]) => setItems(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    let i = 0;
    let hideTimer: ReturnType<typeof setTimeout>;
    const show = () => {
      const item = items[i % items.length];
      // بالتناوب: رسالة عامة ثم رسالة باسم عميلة
      setToast(
        i % 2 === 0
          ? { kind: "saving", item }
          : { kind: "person", name: NAMES[(i >> 1) % NAMES.length], item }
      );
      i++;
      hideTimer = setTimeout(() => setToast(null), 7000);
    };
    const first = setTimeout(show, 5000);
    const loop = setInterval(show, 20000);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
      clearTimeout(hideTimer);
    };
  }, [items]);

  if (!toast) return null;
  const { item } = toast;

  return (
    <a
      href={`/product/${item.slug ?? item.id}`}
      className="proof-toast fixed bottom-4 start-4 z-40 max-w-xs rounded-2xl bg-white shadow-xl border border-save-600/30 p-4 flex gap-3 items-start"
    >
      <span className="text-2xl float-soft" aria-hidden>
        {toast.kind === "person" ? "🛍️" : "💚"}
      </span>
      <span className="text-sm leading-6">
        {toast.kind === "person" ? (
          <>
            <b>{toast.name}</b> وفّرت{" "}
            <b className="text-save-600">
              {item.savings.toFixed(0)} <Riyal />
            </b>{" "}
            على {item.name} بشرائها من {item.storeName}
          </>
        ) : (
          <>
            <b className="text-save-600">
              وفّري {item.savings.toFixed(0)} <Riyal />
            </b>{" "}
            على {item.name} — أرخص سعر الآن{" "}
            <b>
              {item.cheapest.toFixed(2)} <Riyal />
            </b>{" "}
            من {item.storeName}
          </>
        )}
      </span>
    </a>
  );
}
