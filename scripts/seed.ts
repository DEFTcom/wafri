import { db, stores, categories } from "../src/db";

async function main() {
  const existing = await db.select().from(stores);
  if (existing.length > 0) {
    console.log("المتاجر موجودة مسبقاً — تخطي البذور.");
    process.exit(0);
  }

  await db.insert(categories).values([
    { nameAr: "العناية بالبشرة", slug: "skincare" },
    { nameAr: "العناية بالشعر", slug: "hair-care" },
    { nameAr: "العناية بالجسم", slug: "body-care" },
    { nameAr: "العناية بالفم والأسنان", slug: "oral-care" },
    { nameAr: "العناية بالشفاه", slug: "lip-care" },
    { nameAr: "العناية بالعين", slug: "eye-care" },
    { nameAr: "العناية باليدين", slug: "hand-care" },
    { nameAr: "العناية بالقدمين", slug: "foot-care" },
    { nameAr: "عناية المرأة", slug: "women-care" },
    { nameAr: "عناية الرجل", slug: "men-care" },
    { nameAr: "عناية الطفل", slug: "baby-care" },
  ]);

  await db.insert(stores).values([
    { nameAr: "النهدي", baseDomain: "nahdionline.com", platform: "custom" },
    { nameAr: "المتحدة", baseDomain: "unitedpharmacy.sa", platform: "custom" },
    { nameAr: "نايس ون", baseDomain: "niceonesa.com", platform: "custom" },
    { nameAr: "دار الأميرات", baseDomain: "daralamirat.com.sa", platform: "custom" },
    { nameAr: "وايتس", baseDomain: "whites.sa", platform: "custom" },
  ]);

  console.log("تمت إضافة المتاجر الخمسة وفئة العناية بالبشرة.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
