import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-teal-900 text-white/80 text-sm">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-5">
        <div className="flex items-center gap-3">
          <span className="font-heading text-3xl font-bold text-white">
            وفّري<span className="text-rose-600">.</span>
          </span>
          <span className="text-white/50">قارني سعره… ثم وفّري فرقه</span>
        </div>
        <p className="max-w-2xl leading-7">
          نقارن أسعار منتجات العناية من متاجر سعودية موثوقة. الأسعار تُحدَّث
          يومياً وقد تتغير لدى المتجر — السعر النهائي هو المعروض في صفحة المتجر
          نفسه.
        </p>
        <p className="max-w-2xl leading-7">
          الروابط الخارجية تنقلك مباشرة لموقع المتجر. قد نحصل مستقبلاً على
          عمولة من بعض المتاجر عند الشراء عبر روابطنا، دون أي تكلفة إضافية
          عليك.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 border-t border-white/15">
          <Link href="/#categories" className="hover:text-white transition-colors">
            أقسام العناية
          </Link>
          <Link href="/brands" className="hover:text-white transition-colors">
            الماركات
          </Link>
          <Link href="/blog" className="hover:text-white transition-colors">
            دليل الأسعار
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            سياسة الخصوصية
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            شروط الاستخدام
          </Link>
        </div>
      </div>
    </footer>
  );
}
