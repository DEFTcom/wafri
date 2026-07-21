import Link from "next/link";
import { SideDrawer } from "./SideDrawer";

export function Header({ query }: { query?: string }) {
  return (
    <header className="sticky top-0 z-40 bg-teal-900/95 backdrop-blur text-white shadow-lg shadow-teal-900/20">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3 sm:gap-5">
        <SideDrawer />
        <Link href="/" className="shrink-0 group">
          <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
            وفّري
            <span className="text-rose-600 inline-block transition-transform group-hover:scale-150">
              .
            </span>
          </span>
        </Link>
        <form action="/search" className="flex-1 flex min-w-0">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="وش تدورين؟ سيروم، واقي شمس، غسول…"
            className="w-full min-w-0 rounded-e-none rounded-s-full bg-white/95 text-ink px-5 py-2.5 outline-none text-sm focus:bg-white transition-colors"
          />
          <button
            type="submit"
            className="rounded-s-none rounded-e-full bg-rose-600 px-5 sm:px-7 py-2.5 font-semibold text-sm hover:brightness-110 transition-all"
          >
            بحث
          </button>
        </form>
        <nav className="hidden md:flex gap-5 text-sm shrink-0">
          <Link href="/#categories" className="hover:text-rose-600 transition-colors">
            الأقسام
          </Link>
          <Link href="/brands" className="hover:text-rose-600 transition-colors">
            الماركات
          </Link>
          <Link href="/blog" className="hover:text-rose-600 transition-colors">
            دليل الأسعار
          </Link>
        </nav>
      </div>
    </header>
  );
}
