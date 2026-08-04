// وصف المنتج يُكتب بلوحة الإدارة بصيغة بسيطة: سطر يبدأ بـ "## " يصير عنوان
// فرعي (h2) — يفيد السيو لأنه يقسّم المحتوى لمواضيع واضحة بدل فقرة واحدة طويلة.
export type DescriptionBlock = { heading: string | null; paragraphs: string[] };

export function parseProductDescription(raw: string): DescriptionBlock[] {
  const lines = raw.split("\n");
  const blocks: DescriptionBlock[] = [];
  let current: DescriptionBlock = { heading: null, paragraphs: [] };
  let paragraphBuf: string[] = [];

  const flushParagraph = () => {
    const text = paragraphBuf.join(" ").trim();
    if (text) current.paragraphs.push(text);
    paragraphBuf = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      flushParagraph();
      if (current.heading || current.paragraphs.length) blocks.push(current);
      current = { heading: trimmed.slice(3).trim(), paragraphs: [] };
    } else if (trimmed === "") {
      flushParagraph();
    } else {
      paragraphBuf.push(trimmed);
    }
  }
  flushParagraph();
  if (current.heading || current.paragraphs.length) blocks.push(current);
  return blocks;
}

// نص مسطّح بدون علامات العناوين — لـ meta description و JSON-LD
export function flattenProductDescription(raw: string): string {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => (l.startsWith("## ") ? l.slice(3).trim() : l))
    .join(" ")
    .trim();
}
