# قارن العناية — مقارنة أسعار العناية بالبشرة

موقع سعودي يقارن أسعار منتجات العناية بالبشرة بين ٥ متاجر (النهدي، المتحدة، نايس ون، دار الأميرات، وايتس)، مبني بـ Next.js + PostgreSQL + Drizzle وفق مستند المتطلبات التقنية.

## التشغيل محلياً

```bash
npm install
npm run db:start     # يشغل PostgreSQL مضمّن (بدون Docker) — اتركه شغال بنافذة مستقلة
npm run db:push      # تطبيق مخطط قاعدة البيانات
npm run db:seed      # إضافة المتاجر الخمسة والفئات (أول مرة فقط)
npm run dev          # الموقع على http://localhost:3000
```

لوحة الإدارة: `/admin` — كلمة المرور في `.env` (`ADMIN_PASSWORD`).

## الأوامر الدورية (يدوياً الآن، cron عند الاستضافة)

| الأمر | الوظيفة |
|---|---|
| `npm run scrape` | سحب أسعار كل المتاجر وتسجيلها في `price_history` |
| `npx tsx scripts/scrape.ts --store 5` | سحب متجر واحد |
| `npx tsx scripts/scrape.ts --url <رابط> --store 5` | اختبار سحب رابط واحد بدون تخزين |
| `npm run discover` | زحف صفحات الأشهر → `discovery_queue` للمراجعة |
| `npm run match` | المطابقة الذكية (Claude API إن وُجد المفتاح، وإلا قائمة مراجعة يدوية) |

## البنية

- `src/db/schema.ts` — كل الجداول (منتج موحّد + عرض لكل متجر + تاريخ أسعار)
- `src/scrapers/` — سحب عام يعتمد JSON-LD أولاً ثم محددات CSS من `stores.scraper_config`؛ سكربتات مخصصة تُضاف في `stores/`
- `src/matching/` — تطبيع نص + تشابه + تحقق Claude (≥90٪ دمج تلقائي، أقل → مراجعة)
- `src/lib/outbound-link.ts` — الدالة المركزية للروابط الخارجية: تفعيل العمولة لاحقاً = تعديل صف المتجر فقط
- `src/app/go/[offerId]/` — كل أزرار «اشترِ الآن» تمر من هنا (تسجيل نقرة + تحويل)

## ملاحظات الاستضافة لاحقاً

- استبدل القاعدة المضمنة بـ `docker-compose.yml` المرفق أو قاعدة سحابية — فقط غيّر `DATABASE_URL`
- أضف cron يومي: `npm run scrape` ثم `npm run match`
- عيّن `SITE_URL` و`SESSION_SECRET` و`ADMIN_PASSWORD` قوية و`ANTHROPIC_API_KEY`
- سكربتا النهدي ونايس ون يحتاجان تخصيصاً (مواقع JavaScript) — راجع `src/scrapers/stores/index.ts`
