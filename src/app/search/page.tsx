import { cookies } from "next/headers";
import { CookieBanner } from "@/components/CookieBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { db, searchLogs } from "@/db";
import { searchProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "نتائج البحث" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchProducts(query) : [];

  if (query) {
    // سجل بحث مجهول — بدون بيانات شخصية (§متطلبات الخصوصية)
    const sid = (await cookies()).get("sid")?.value ?? "anonymous";
    await db.insert(searchLogs).values({
      queryText: query,
      resultsCount: results.length,
      sessionId: sid,
    });
  }

  return (
    <>
      <Header query={query} />
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-8">
        <h1 className="text-2xl mb-6">
          {query ? `نتائج البحث عن «${query}»` : "اكتبي كلمة للبحث"}
        </h1>
        {query && results.length === 0 && (
          <p className="text-ink/60 py-16 text-center">
            ما لقينا نتائج — جربي كلمة أعم مثل «سيروم» أو اسم الماركة.
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>
      <Footer />
      <CookieBanner />
    </>
  );
}
