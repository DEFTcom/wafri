"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

type NavItem = { href: string; label: string; icon: string; badge?: number };
type NavSection = { title: string; items: NavItem[] };

export function Sidebar({
  sections,
}: {
  sections: NavSection[];
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-teal-900 text-white flex flex-col">
      <Link href="/admin" className="shrink-0 px-6 py-5 border-b border-white/10">
        <span className="font-heading text-2xl font-bold tracking-tight">
          وفّري
          <span className="text-rose-600">.</span>
        </span>
        <span className="block text-xs text-white/40 mt-0.5">لوحة الإدارة</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 text-xs font-bold text-white/40 mb-1.5">{section.title}</h3>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span aria-hidden>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {!!item.badge && (
                    <span className="rounded-full bg-rose-600 text-white text-xs font-bold min-w-5 h-5 px-1 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3 space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
        >
          <span aria-hidden>🌐</span> زيارة الموقع
        </Link>
        <form action={logoutAction}>
          <button className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-rose-600/20 hover:text-rose-200 transition-colors">
            <span aria-hidden>🚪</span> تسجيل الخروج
          </button>
        </form>
      </div>
    </aside>
  );
}
