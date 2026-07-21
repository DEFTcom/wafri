import { NextResponse } from "next/server";
import { runAllStores } from "@/scrapers/runner";

// يستدعيه Vercel Cron يومياً (راجعي vercel.json) بدل تشغيل npm run scrape يدوياً.
// Vercel يرسل Authorization: Bearer <CRON_SECRET> تلقائياً لو ضبطتِ متغير
// البيئة CRON_SECRET — هذا يمنع أي حد غريب يشغّل السحب عبر الرابط مباشرة.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await runAllStores();
  return NextResponse.json({ ok: true });
}
