import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SafeImage } from "@/components/SafeImage";
import { listArticles } from "@/lib/blog";

export const dynamic = "force-dynamic";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

export const metadata = {
  title: "دليل أسعار العناية — مقالات مقارنة محدثة يومياً",
  description:
    "مقالات مقارنة أسعار منتجات العناية بالبشرة بين المتاجر السعودية، تتحدث تلقائياً مع كل تحديث أسعار.",
  alternates: { canonical: `${SITE}/blog` },
};

export default async function BlogIndexPage() {
  const articles = await listArticles();

  return (
    <>
      <Header />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-10">
        <h1 className="text-3xl mb-2">دليل أسعار العناية</h1>
        <p className="text-ink/60 mb-8">
          مقالات تتحدث تلقائياً مع كل تحديث أسعار — الأرقام هنا حية من المتاجر.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/blog/${a.slug}`}
              className="card-hover group rounded-3xl bg-white border border-teal-700/10 overflow-hidden flex flex-col"
            >
              <div className="relative h-44 bg-cream flex items-center justify-center overflow-hidden">
                {a.imageUrl ? (
                  <SafeImage
                    src={a.imageUrl}
                    alt={a.title}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-5xl" aria-hidden>📊</span>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-lg leading-8 mb-2">{a.title}</h2>
                <p className="text-sm text-ink/60 line-clamp-2">{a.description}</p>
                <span className="arrow-link text-rose-600 text-sm font-semibold mt-auto pt-3 inline-block">
                  اقرأ المقارنة <span className="arrow">←</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
