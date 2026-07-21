import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// ٢٠ اتصال افتراضياً: السحب اليومي يشغّل حتى ١٥ طلب متوازي لكل متجر × ٥ متاجر
// بالتوازي — pool صغير (كان ٣) كان يخنق كل هذا التزامن ويسبب بطء وهمي بدل
// ما يكون فعلاً أسرع. Neon (رابط الـ pooler) يتحمّل هذا العدد بسهولة.
const client = postgres(process.env.DATABASE_URL!, {
  max: Number(process.env.DB_POOL_MAX ?? 20),
});

export const db = drizzle(client, { schema });
export * from "./schema";
