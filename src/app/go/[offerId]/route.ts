import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clickLogs, db, storeOffers, stores } from "@/db";
import { buildOutboundLink } from "@/lib/outbound-link";

// مسار "اشترِ الآن" — كل الروابط الخارجية تمر من هنا:
// يسجل النقرة للتحليلات ثم يحوّل عبر buildOutboundLink (جاهز للعمولة).
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ offerId: string }> }
) {
  const { offerId } = await params;
  const id = Number(offerId);
  if (!Number.isInteger(id)) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  const [row] = await db
    .select({ offer: storeOffers, store: stores })
    .from(storeOffers)
    .innerJoin(stores, eq(stores.id, storeOffers.storeId))
    .where(eq(storeOffers.id, id));

  if (!row) return NextResponse.redirect(new URL("/", _req.url));

  const sid = (await cookies()).get("sid")?.value ?? null;
  await db.insert(clickLogs).values({ storeOfferId: id, sessionId: sid });

  return NextResponse.redirect(buildOutboundLink(row.offer, row.store), 302);
}
