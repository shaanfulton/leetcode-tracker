import { ensureInitialized } from "@/lib/db";

async function main() {
  try {
    await ensureInitialized({ allowMigrate: true });
    // eslint-disable-next-line no-console
    console.log("Migrations completed.");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Migration failed:", err);
    process.exitCode = 1;
  }
}

main();
