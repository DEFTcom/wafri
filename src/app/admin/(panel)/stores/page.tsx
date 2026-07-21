import { eq, sql } from "drizzle-orm";
import { db, storeOffers, stores } from "@/db";
import { Collapsible } from "@/components/admin/Collapsible";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { StoreLogo } from "@/components/StoreLogo";
import { addStoreAction, deleteStoreAction, updateStoreAction } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة المتاجر" };

const AFFILIATE_STYLE: Record<string, string> = {
  none: "bg-ink/5 text-ink/50",
  pending: "bg-gold-400/20 text-gold-400",
  active: "bg-save-600/10 text-save-600",
};

const AFFILIATE_LABEL: Record<string, string> = {
  none: "لا يوجد",
  pending: "قيد التفاوض",
  active: "مفعّلة",
};

export default async function AdminStoresPage() {
  const list = await db
    .select({
      id: stores.id,
      nameAr: stores.nameAr,
      baseDomain: stores.baseDomain,
      logoUrl: stores.logoUrl,
      isActive: stores.isActive,
      affiliateStatus: stores.affiliateStatus,
      affiliateId: stores.affiliateId,
      affiliateLinkTemplate: stores.affiliateLinkTemplate,
      offersCount: sql<number>`count(${storeOffers.id})::int`,
    })
    .from(stores)
    .leftJoin(storeOffers, eq(storeOffers.storeId, stores.id))
    .groupBy(stores.id)
    .orderBy(stores.id);

  const inputCls =
    "w-full rounded-xl border border-teal-700/20 px-3 py-2.5 text-sm outline-none focus:border-rose-600 transition-colors";

  return (
    <div className="space-y-6">
      <div>
        <span className="text-teal-700 font-bold text-sm">🏬 شركاؤنا</span>
        <h1 className="text-3xl mt-1">المتاجر</h1>
      </div>
      <p className="text-sm text-ink/60 bg-white rounded-2xl p-4 border border-teal-700/10">
        💡 يوم تنعقد اتفاقية عمولة: غيّري الحالة إلى «مفعّلة» وأدخلي نمط الرابط —
        الموقع كامل يتحول تلقائياً بدون أي تعديل كود. المتغيرات المتاحة:{" "}
        <code dir="ltr" className="bg-cream rounded px-1.5 py-0.5">{"{url} {raw_url} {affiliate_id} {tracking_param}"}</code>
      </p>

      <Collapsible title="إضافة متجر جديد" icon="➕">
        <form action={addStoreAction} className="grid sm:grid-cols-2 gap-3">
          <input name="name_ar" required placeholder="اسم المتجر *" className={inputCls} />
          <input name="base_domain" required dir="ltr" placeholder="النطاق الأساسي (مثال: example.com) *" className={inputCls} />
          <select name="platform" defaultValue="custom" className={inputCls}>
            <option value="custom">مخصص</option>
            <option value="salla">سلة</option>
            <option value="zid">زد</option>
          </select>
          <input name="logo_url" dir="ltr" placeholder="رابط الشعار (اختياري)" className={inputCls} />
          <button className="rounded-xl bg-rose-600 text-white px-6 py-2.5 font-semibold hover:brightness-110 transition-all w-fit sm:col-span-2">
            إضافة المتجر
          </button>
        </form>
        <p className="text-xs text-ink/50 mt-3">
          بعد الإضافة، إعداد سحب الأسعار الفعلي (scraper_config) يحتاج تعديل تقني مباشر بقاعدة البيانات.
        </p>
      </Collapsible>

      <div className="space-y-4">
        {list.map((s) => (
          <div key={s.id} className="card-hover rounded-3xl bg-white border border-teal-700/10 p-6 space-y-3">
            <form action={updateStoreAction} className="grid sm:grid-cols-2 gap-3">
              <input type="hidden" name="id" value={s.id} />
              <div className="sm:col-span-2 flex items-center gap-4 mb-1 flex-wrap">
                <StoreLogo src={s.logoUrl} name={s.nameAr} />
                <div>
                  <span className="font-bold block">{s.nameAr}</span>
                  <span className="text-xs text-ink/50" dir="ltr">{s.baseDomain}</span>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${AFFILIATE_STYLE[s.affiliateStatus]}`}>
                  عمولة: {AFFILIATE_LABEL[s.affiliateStatus]}
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-bold bg-teal-700/10 text-teal-700">
                  {s.offersCount} عرض مربوط
                </span>
                <label className="ms-auto text-sm flex items-center gap-2 shrink-0">
                  <input type="checkbox" name="is_active" defaultChecked={s.isActive} className="accent-rose-600" />
                  متجر نشط
                </label>
              </div>
              <select name="affiliate_status" defaultValue={s.affiliateStatus} className={inputCls}>
                <option value="none">عمولة: لا يوجد</option>
                <option value="pending">عمولة: قيد التفاوض</option>
                <option value="active">عمولة: مفعّلة</option>
              </select>
              <input
                name="affiliate_id"
                defaultValue={s.affiliateId ?? ""}
                placeholder="معرّف العمولة"
                dir="ltr"
                className={inputCls}
              />
              <input
                name="affiliate_link_template"
                defaultValue={s.affiliateLinkTemplate ?? ""}
                placeholder="نمط الرابط المتتبع، مثال: https://track.example.com?aff={affiliate_id}&url={url}"
                dir="ltr"
                className={`${inputCls} sm:col-span-2`}
              />
              <button className="rounded-xl bg-rose-600 text-white px-6 py-2.5 text-sm font-semibold w-fit hover:brightness-110 transition-all">
                حفظ
              </button>
            </form>
            {s.offersCount === 0 && (
              <form action={deleteStoreAction} className="pt-2 border-t border-teal-700/10">
                <input type="hidden" name="id" value={s.id} />
                <ConfirmSubmitButton
                  confirmMessage={`حذف متجر «${s.nameAr}» نهائياً؟`}
                  className="text-xs text-rose-600 hover:underline"
                >
                  حذف المتجر
                </ConfirmSubmitButton>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
