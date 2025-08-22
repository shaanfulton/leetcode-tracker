import { NextRequest, NextResponse } from "next/server";
import { ensureInitialized, pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { fetchLeetCodeMeta } from "@/lib/leetcode";

export async function GET() {
  try {
    await ensureInitialized({
      allowMigrate: process.env.NODE_ENV !== "production",
    });
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json([]);
    }
    const dbUserId: number | null =
      (session as Session & { dbUserId?: number })?.dbUserId ?? null;
    const { rows } = await pool.query(
      `SELECT id, url, title, difficulty, tags, minutes_to_solve AS "minutesToSolve", created_at AS "createdAt"
       FROM problems
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [dbUserId]
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
    await ensureInitialized({
      allowMigrate: process.env.NODE_ENV !== "production",
    });
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const dbUserId: number | null =
      (session as Session & { dbUserId?: number })?.dbUserId ?? null;
    const body = await req.json();
    const { url, minutesToSolve, title } = body ?? {};
    if (!url || typeof minutesToSolve !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const meta = await fetchLeetCodeMeta(url);
    const { rows } = await pool.query(
      `INSERT INTO problems (url, minutes_to_solve, title, difficulty, tags, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, url, title, difficulty, tags, minutes_to_solve AS "minutesToSolve", created_at AS "createdAt"`,
      [
        url,
        minutesToSolve,
        title ?? meta.title,
        meta.difficulty,
        meta.tags,
        dbUserId,
      ]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/problems error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureInitialized({
      allowMigrate: process.env.NODE_ENV !== "production",
    });
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const dbUserId: number | null =
      (session as Session & { dbUserId?: number })?.dbUserId ?? null;
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");
    const id = idParam ? Number(idParam) : NaN;
    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        { error: "Missing or invalid id" },
        { status: 400 }
      );
    }
    await pool.query(`DELETE FROM problems WHERE id = $1 AND user_id = $2`, [
      id,
      dbUserId,
    ]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/problems error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
