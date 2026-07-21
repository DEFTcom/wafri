import { normalizeTitle, extractSize } from "../lib/normalize";

// معامل Dice على ثنائيات الأحرف — كافٍ للترشيح الأولي بدون اعتماديات
export function similarity(a: string, b: string): number {
  const bigrams = (s: string) => {
    const map = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.slice(i, i + 2);
      map.set(bg, (map.get(bg) ?? 0) + 1);
    }
    return map;
  };
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const ma = bigrams(na);
  const mb = bigrams(nb);
  let overlap = 0;
  let total = 0;
  for (const [bg, count] of ma) {
    overlap += Math.min(count, mb.get(bg) ?? 0);
    total += count;
  }
  for (const count of mb.values()) total += count;
  return total === 0 ? 0 : (2 * overlap) / total;
}

export type Candidate<T> = { item: T; score: number };

// ترشيح أقرب ٣-٥ عناوين محتملة — §٤ خطوة ٢. اختلاف الحجم الصريح يستبعد المرشح.
export function rankCandidates<T>(
  title: string,
  pool: { title: string; item: T }[],
  limit = 5,
  minScore = 0.35
): Candidate<T>[] {
  const size = extractSize(title);
  return pool
    .filter((p) => {
      const other = extractSize(p.title);
      return !size || !other || size === other;
    })
    .map((p) => ({ item: p.item, score: similarity(title, p.title) }))
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
