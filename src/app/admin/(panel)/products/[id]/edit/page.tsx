import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db, categories, products, storeOffers, stores } from "@/db";
import { ProductFormFields } from "@/components/admin/ProductFormFields";
import { buildProductAutoMeta, buildSmartProductSeo } from "@/lib/seo";
import { scrapeProductAction, updateProductAction } from "../../../../actions";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";
export const metadata = { title: "تعديل منتج" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const [product] = await db.select().from(products).where(eq(products.id, productId));
  if (!product) notFound();

  const [allStores, allCategories, existingOffers] = await Promise.all([
    db.select().from(stores).where(eq(stores.isActive, true)),
    db.select().from(categories),
    db.select().from(storeOffers).where(eq(storeOffers.productId, productId)),
  ]);

  const offersMap = Object.fromEntries(
    existingOffers.map((o) => [
      o.storeId,
      {
        url: o.productUrl,
        coupon: o.couponCode,
        price: o.currentPrice,
        manual: o.linkMode === "manual",
      },
    ])
  );

  const storeNameById = Object.fromEntries(allStores.map((s) => [s.id, s.nameAr]));
  const offersForMeta = existingOffers.map((o) => ({
    storeName: storeNameById[o.storeId] ?? "",
    currentPrice: o.currentPrice,
    isAvailable: o.isAvailable,
  }));
  const auto = buildProductAutoMeta(product, offersForMeta);
  const categoryName = allCategories.find((c) => c.id === product.categoryId)?.nameAr;
  const smart = buildSmartProductSeo(product, offersForMeta, categoryName);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-teal-700 hover:underline text-sm">
          ← المنتجات
        </Link>
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div>
          <span className="text-teal-700 font-bold text-sm">✏️ تعديل</span>
          <h1 className="text-3xl mt-1">{product.nameAr}</h1>
        </div>
        {existingOffers.some((o) => o.linkMode === "auto") && (
          <form action={scrapeProductAction} className="ms-auto">
            <input type="hidden" name="product_id" value={product.id} />
            <button className="rounded-xl bg-teal-700 text-white px-5 py-2.5 text-sm font-semibold hover:brightness-110 transition-all">
              🔄 سحب الأسعار الآن
            </button>
          </form>
        )}
      </div>

      {existingOffers.length === 0 && (
        <div className="rounded-2xl bg-gold-400/10 border border-gold-400/30 p-4 text-sm leading-7">
          <b className="block mb-1">⚠️ هذا المنتج بدون أي متجر مربوط — ما راح يظهر له سعر ولا يقارن أي شي.</b>
          لازم تضيفي رابط المنتج الحقيقي بمتجر واحد على الأقل بالأسفل. لو ما
          تعرفين الرابط، اضغطي «🔍 ابحث» جنب اسم المتجر ليفتح بحث Google
          محصور بذاك الموقع، وانسخي رابط المنتج الصحيح من النتائج. بعدها إما:
          <br />• تتركين «سعر يدوي» غير مفعّل والسعر يتحدث تلقائياً بالسحب
          اليومي (<code dir="ltr" className="bg-white rounded px-1">npm run scrape</code>)، أو
          <br />• تفعّلين «سعر يدوي» وتكتبين السعر الحين مباشرة.
        </div>
      )}

      {existingOffers.length > 0 &&
        existingOffers.every((o) => o.linkMode === "auto" && !o.currentPrice) && (
          <div className="rounded-2xl bg-gold-400/10 border border-gold-400/30 p-4 text-sm leading-7">
            <b>⚠️ الروابط مربوطة لكن السعر ما تحدّث بعد.</b> اضغطي «🔄 سحب
            الأسعار الآن» بالأعلى عشان يجيب السعر فوراً بدل ما تنتظري السحب
            اليومي التلقائي.
          </div>
        )}

      <section className="rounded-3xl bg-white border border-teal-700/10 p-6">
        <form id="product-form" action={updateProductAction} className="space-y-4">
          <input type="hidden" name="id" value={product.id} />
          <ProductFormFields
            categories={allCategories}
            stores={allStores}
            defaults={{
              nameAr: product.nameAr,
              brand: product.brand,
              sizeVariant: product.sizeVariant,
              imageUrl: product.imageUrl,
              categoryId: product.categoryId,
              description: product.description,
            }}
            offers={offersMap}
            seo={{
              metaTitle: product.metaTitle,
              metaDescription: product.metaDescription,
              noindex: product.noindex,
              previewUrl: `${SITE.replace(/^https?:\/\//, "")}/product/${product.slug ?? product.id}`,
              autoTitle: auto.title,
              autoDescription: auto.description,
              smartTitle: smart.title,
              smartDescription: smart.description,
            }}
          />
          <div className="flex gap-3">
            <button className="rounded-xl bg-rose-600 text-white px-6 py-2.5 font-semibold hover:brightness-110 transition-all">
              حفظ التعديلات
            </button>
            <a
              href={`/product/${product.slug ?? product.id}`}
              target="_blank"
              className="rounded-xl bg-teal-700/10 text-teal-700 px-6 py-2.5 font-semibold hover:bg-teal-700/20 transition-colors"
            >
              معاينة بالموقع
            </a>
          </div>
        </form>
      </section>
    </div>
  );
}
