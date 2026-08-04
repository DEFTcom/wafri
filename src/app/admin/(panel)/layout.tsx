import { and, eq, isNotNull } from "drizzle-orm";
import { Sidebar } from "@/components/admin/Sidebar";
import { db, discoveryQueue, matchQueue, productRatings, storeOffers } from "@/db";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const [pendingDiscoveryRows, pendingMatchRows, failingOfferRows] = await Promise.all([
    db.select({ id: discoveryQueue.id }).from(discoveryQueue).where(eq(discoveryQueue.status, "pending")),
    db.select({ id: matchQueue.id }).from(matchQueue).where(eq(matchQueue.status, "pending")),
    db.select({ id: storeOffers.id }).from(storeOffers).where(eq(storeOffers.lastScrapeStatus, "failed")),
  ]);
  const pendingDiscoveries = pendingDiscoveryRows.length;
  const pendingMatches = pendingMatchRows.length;
  const failingOffers = failingOfferRows.length;
  // استعلام منفصل بـ catch مستقل — عمود comment أُضيف بترحيل لاحق، وما
  // نبي فشل مؤقت فيه (قبل تشغيل ترحيل قاعدة البيانات) يكسر لوحة الإدارة كلها
  const pendingReviews = await db
    .select({ id: productRatings.id })
    .from(productRatings)
    .where(and(isNotNull(productRatings.comment), eq(productRatings.commentStatus, "pending")))
    .then((rows) => rows.length)
    .catch(() => 0);

  const sections = [
    {
      title: "الرئيسية",
      items: [{ href: "/admin", label: "حالة السحب", icon: "📡", badge: failingOffers }],
    },
    {
      title: "المحتوى",
      items: [
        { href: "/admin/products", label: "المنتجات", icon: "🧴" },
        { href: "/admin/discoveries", label: "الاكتشافات", icon: "🔎", badge: pendingDiscoveries },
        { href: "/admin/matches", label: "المطابقات", icon: "🔗", badge: pendingMatches },
        { href: "/admin/reviews", label: "التقييمات", icon: "💬", badge: pendingReviews },
      ],
    },
    {
      title: "النمو",
      items: [
        { href: "/admin/seo", label: "السيو", icon: "🚀" },
        { href: "/admin/analytics", label: "التحليلات", icon: "📊" },
      ],
    },
    {
      title: "الإعدادات",
      items: [{ href: "/admin/stores", label: "المتاجر", icon: "🏬" }],
    },
  ];

  return (
    <div className="flex-1 flex bg-cream min-h-screen">
      <Sidebar sections={sections} />
      <main className="flex-1 min-w-0 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
