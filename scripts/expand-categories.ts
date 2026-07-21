// توسعة الأقسام: القسم القديم يصير «العناية بالبشرة» + إضافة ١٠ أقسام عناية جديدة
import { eq } from "drizzle-orm";
import { db, categories } from "../src/db";

const NEW_CATEGORIES = [
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
];

(async () => {
  await db
    .update(categories)
    .set({ nameAr: "العناية بالبشرة" })
    .where(eq(categories.slug, "skincare"));

  for (const cat of NEW_CATEGORIES) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }

  const all = await db.select().from(categories);
  console.log(all.map((c) => `${c.id}: ${c.nameAr} (${c.slug})`).join("\n"));
  process.exit(0);
})();
