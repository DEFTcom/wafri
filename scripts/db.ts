// تشغيل PostgreSQL محلي مضمّن (بدون Docker) — للتطوير فقط.
// عند الرفع للاستضافة يُستبدل بقاعدة حقيقية عبر DATABASE_URL فقط.
import EmbeddedPostgres from "embedded-postgres";
import path from "node:path";

const pg = new EmbeddedPostgres({
  databaseDir: path.join(process.cwd(), ".pgdata"),
  user: "care",
  password: "care_local_dev",
  port: 5432,
  persistent: true,
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

async function main() {
  const initialized = await import("node:fs").then((fs) =>
    fs.existsSync(path.join(process.cwd(), ".pgdata", "PG_VERSION"))
  );
  if (!initialized) {
    await pg.initialise();
  }
  await pg.start();
  if (!initialized) {
    await pg.createDatabase("care_compare");
  }
  console.log("PostgreSQL يعمل على المنفذ 5432 — اضغط Ctrl+C للإيقاف.");

  const stop = async () => {
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
