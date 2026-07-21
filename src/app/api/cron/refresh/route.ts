import { NextResponse } from "next/server";
import { runDiscovery } from "@/scrapers/discover";
import { runMatching } from "@/matching/run";

// أسبوعي (راجعي vercel.json) — يجمع الاكتشاف والمطابقة الذكية بمسار واحد
// لأن خطة Vercel Hobby تسمح بمهمتين مجدولتين بس، وهذا العرض الآخر
// (السحب اليومي بـ /api/cron/scrape ياخذ المهمة الأولى).
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const discovered = await runDiscovery();
  const { merged, queued } = await runMatching();
  return NextResponse.json({ ok: true, discovered, merged, queued });
}
