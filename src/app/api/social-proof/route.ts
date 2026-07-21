import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db, products, storeOffers, stores } from "@/db";

// بيانات التوفير الحقيقية للإشعارات المنبثقة — أعلى فروقات الأسعار حالياً
export async function GET() {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.nameAr,
      savings: sql<string>`max(${storeOffers.currentPrice}) - min(${storeOffers.currentPrice})`,
      cheapest: sql<string>`min(${storeOffers.currentPrice})`,
    })
    .from(products)
    .innerJoin(
      storeOffers,
      and(
        eq(storeOffers.productId, products.id),
        eq(storeOffers.isAvailable, true),
        sql`${storeOffers.currentPrice} is not null`
      )
    )
    .groupBy(products.id)
    .having(sql`count(*) >= 2 and max(${storeOffers.currentPrice}) > min(${storeOffers.currentPrice})`)
    .orderBy(sql`max(${storeOffers.currentPrice}) - min(${storeOffers.currentPrice}) desc`)
    .limit(6);

  const result = await Promise.all(
    rows.map(async (r) => {
      const [cheapestStore] = await db
        .select({ storeName: stores.nameAr })
        .from(storeOffers)
        .innerJoin(stores, eq(stores.id, storeOffers.storeId))
        .where(
          and(
            eq(storeOffers.productId, r.id),
            eq(storeOffers.currentPrice, r.cheapest)
          )
        )
        .limit(1);
      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        savings: Number(r.savings),
        cheapest: Number(r.cheapest),
        storeName: cheapestStore?.storeName ?? "",
      };
    })
  );

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
