import { NextRequest, NextResponse } from "next/server";
import { ensureInitialized, pool } from "@/lib/db";
import { fetchLeetCodeMeta } from "@/lib/leetcode";

export async function GET() {
  try {
    await ensureInitialized();
    const { rows } = await pool.query(
      `SELECT id, url, title, difficulty, tags, minutes_to_solve AS "minutesToSolve", created_at AS "createdAt"
       FROM problems
       ORDER BY created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/problems error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureInitialized();
    const body = await req.json();
    const { url, minutesToSolve, title } = body ?? {};
    if (!url || typeof minutesToSolve !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const meta = await fetchLeetCodeMeta(url);
    const { rows } = await pool.query(
      `INSERT INTO problems (url, minutes_to_solve, title, difficulty, tags)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, url, title, difficulty, tags, minutes_to_solve AS "minutesToSolve", created_at AS "createdAt"`,
      [url, minutesToSolve, title ?? meta.title, meta.difficulty, meta.tags]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/problems error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
