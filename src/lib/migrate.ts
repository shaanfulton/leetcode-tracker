import { promises as fs } from "fs";
import path from "path";
import { pool } from "./db";

function isSqlMigrationFile(fileName: string): boolean {
  return /^\d{3,}_.+\.sql$/i.test(fileName);
}

let hasRun = false;

export async function runMigrations(): Promise<void> {
  if (hasRun) return;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query("COMMIT");

    const migrationsDir = path.join(process.cwd(), "migrations");
    let files: string[] = [];
    try {
      files = await fs.readdir(migrationsDir);
    } catch {
      // No migrations directory; nothing to do
      hasRun = true;
      return;
    }

    const migrationFiles = files
      .filter(isSqlMigrationFile)
      .sort((a, b) => a.localeCompare(b));

    for (const file of migrationFiles) {
      const { rows } = await client.query<{ count: string }>(
        "SELECT COUNT(1)::text as count FROM migrations WHERE filename = $1",
        [file]
      );
      const alreadyApplied = rows[0] && rows[0].count === "1";
      if (alreadyApplied) continue;

      const fullPath = path.join(migrationsDir, file);
      const sql = await fs.readFile(fullPath, "utf8");

      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
          file,
        ]);
        await client.query("COMMIT");
        // eslint-disable-next-line no-console
        console.log(`[migrate] applied ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");
        // eslint-disable-next-line no-console
        console.error(`[migrate] failed on ${file}:`, err);
        throw err;
      }
    }
    hasRun = true;
  } finally {
    client.release();
  }
}
