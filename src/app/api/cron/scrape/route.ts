import { NextResponse } from "next/server";
import { runAllStores } from "@/scrapers/runner";

// أقصى مدة مسموحة بخطة Vercel Hobby — بدونها الدالة تنقطع بعد ١٠ ثواني بس
export const maxDuration = 60;

// يستدعيه Vercel Cron يومياً (راجعي vercel.json) بدل تشغيل npm run scrape يدوياً.
// Vercel يرسل Authorization: Bearer <CRON_SECRET> تلقائياً لو ضبطتِ متغير
// البيئة CRON_SECRET — هذا يمنع أي حد غريب يشغّل السحب عبر الرابط مباشرة.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // هامش أمان ١٠ ثواني تحت maxDuration عشان نرجّع رد نظيف قبل ما Vercel تقتل الدالة
  const deadline = Date.now() + (maxDuration - 10) * 1000;
  await runAllStores(deadline);
  return NextResponse.json({ ok: true });
}
