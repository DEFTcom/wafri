import Anthropic from "@anthropic-ai/sdk";

export type MatchVerdict = {
  isMatch: boolean;
  confidence: number; // 0–100
};

// §٤ خطوة ٣ — التحقق النهائي عبر Claude API: هل العنوانان لنفس المنتج؟
export async function verifyMatch(
  titleA: string,
  titleB: string
): Promise<MatchVerdict | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null; // المطابقة الذكية معطلة بدون مفتاح

  const client = new Anthropic();
  const res = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 200,
    system:
      "أنت مدقق مطابقة منتجات تجميل وعناية بالبشرة بين متاجر سعودية. يصلك عنوانا منتجين من متجرين مختلفين. قرر إن كانا نفس المنتج تماماً (نفس الماركة والمنتج والحجم والتركيز). اختلاف اللغة (عربي/إنجليزي) لا يمنع التطابق. أجب بـ JSON فقط بالشكل: {\"is_match\": true|false, \"confidence\": 0-100}",
    messages: [
      {
        role: "user",
        content: `المنتج الأول: ${titleA}\nالمنتج الثاني: ${titleB}`,
      },
    ],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  const jsonMatch = text.match(/\{[^}]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      is_match?: boolean;
      confidence?: number;
    };
    return {
      isMatch: Boolean(parsed.is_match),
      confidence: Math.max(0, Math.min(100, Number(parsed.confidence) || 0)),
    };
  } catch {
    return null;
  }
}
