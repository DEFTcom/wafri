import Link from "next/link";

const TABS = [
  { href: "/admin/seo", label: "نظرة عامة وإعدادات" },
  { href: "/admin/seo/products", label: "سيو المنتجات" },
  { href: "/admin/seo/articles", label: "سيو المقالات" },
];

export function SeoSubNav({ active }: { active: string }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
            active === t.href
              ? "bg-rose-600 text-white"
              : "bg-white text-teal-700 border border-teal-700/10 hover:bg-teal-700/5"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
