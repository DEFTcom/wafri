import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// pool صغير: عمال بناء Next المتوازون قد يفتحون عدة نسخ منه في آن واحد
const client = postgres(process.env.DATABASE_URL!, {
  max: Number(process.env.DB_POOL_MAX ?? 3),
});

export const db = drizzle(client, { schema });
export * from "./schema";
