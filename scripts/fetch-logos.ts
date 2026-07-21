// يجلب شعار (favicon) كل متجر ويخزنه محلياً في public/logos
import { writeFileSync } from "node:fs";
import { eq } from "drizzle-orm";
import { db, stores } from "../src/db";

(async () => {
  const all = await db.select().from(stores);
  for (const store of all) {
    try {
      const res = await fetch(
        `https://www.google.com/s2/favicons?domain=${store.baseDomain}&sz=128`,
        { headers: { "User-Agent": "Mozilla/5.0" } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const path = `public/logos/${store.id}.png`;
      writeFileSync(path, buf);
      await db
        .update(stores)
        .set({ logoUrl: `/logos/${store.id}.png` })
        .where(eq(stores.id, store.id));
      console.log(`${store.nameAr} → ${path} (${buf.length} bytes)`);
    } catch (e) {
      console.error(`${store.nameAr}: فشل — ${e instanceof Error ? e.message : e}`);
    }
  }
  process.exit(0);
})();
