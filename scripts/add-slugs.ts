// ترقية لمرة واحدة: إضافة عمود slug وتعبئته للمنتجات الموجودة
import { eq, sql } from "drizzle-orm";
import { db, products } from "../src/db";
import { uniqueProductSlug } from "../src/lib/slug";

(async () => {
  await db.execute(sql`alter table products add column if not exists slug text`);
  const all = await db.select().from(products);
  for (const p of all) {
    if (!p.slug) {
      const slug = await uniqueProductSlug(p.nameAr, p.sizeVariant);
      await db.update(products).set({ slug }).where(eq(products.id, p.id));
      console.log(p.id, "→", slug);
    }
  }
  await db.execute(
    sql`do $$ begin
      alter table products add constraint products_slug_unique unique (slug);
    exception when duplicate_table then null; when duplicate_object then null; end $$`
  );
  console.log("done");
  process.exit(0);
})();
