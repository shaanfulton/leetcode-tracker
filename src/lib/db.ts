import { Pool } from "pg";
import { runMigrations } from "./migrate";

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __dbInitialized: boolean | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@127.0.0.1:5433/leettracker";

export const pool: Pool = global.__dbPool || new Pool({ connectionString });
if (!global.__dbPool) {
  global.__dbPool = pool;
}

export async function ensureInitialized(): Promise<void> {
  if (global.__dbInitialized) return;
  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error("Failed to connect to Postgres with", connectionString);
    throw err;
  }
  try {
    // Run SQL migrations (idempotent)
    await runMigrations();
    global.__dbInitialized = true;
  } finally {
    client.release();
  }
}
