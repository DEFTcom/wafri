"use client";

// زر "جلب بيانات" — يفتح بحث Google محصور بكل متجر بتبويب منفصل دفعة وحدة،
// عشان توفري وقت البحث عن رابط المنتج بكل متجر بدل ما تفتحين كل واحد لحاله.
// بدون أي API مدفوع — مجرد فتح روابط بحث Google العادية.
type Store = { id: number; nameAr: string; baseDomain: string };

export function FetchDataButton({ stores }: { stores: Store[] }) {
  const fetchData = () => {
    const form = document.getElementById("product-form") as HTMLFormElement | null;
    const name = (form?.elements.namedItem("name_ar") as HTMLInputElement | null)?.value.trim();
    const brand = (form?.elements.namedItem("brand") as HTMLInputElement | null)?.value.trim();
    if (!name) {
      alert("اكتبي اسم المنتج أولاً");
      return;
    }
    const query = [brand, name].filter(Boolean).join(" ");
    for (const s of stores) {
      const q = encodeURIComponent(`site:${s.baseDomain} ${query}`);
      window.open(`https://www.google.com/search?q=${q}`, "_blank", "noopener");
    }
  };

  return (
    <button
      type="button"
      onClick={fetchData}
      title="يفتح بحث Google لكل متجر بتبويب منفصل حسب اسم المنتج والماركة"
      className="rounded-xl bg-gold-400/20 text-ink px-4 py-2.5 text-sm font-semibold hover:bg-gold-400/30 transition-colors whitespace-nowrap"
    >
      ⚡ جلب بيانات (فتح بحث بكل المتاجر)
    </button>
  );
}
