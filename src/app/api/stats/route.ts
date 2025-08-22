import { NextResponse } from "next/server";
import { ensureInitialized, pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import type { Session } from "next-auth";

export async function GET() {
  try {
    await ensureInitialized({
      allowMigrate: process.env.NODE_ENV !== "production",
    });
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ averageMinutes: 0, count: 0 });
    }
    const dbUserId: number | null =
      (session as Session & { dbUserId?: number })?.dbUserId ?? null;
    const { rows } = await pool.query(
      `SELECT COALESCE(AVG(minutes_to_solve), 0) AS "averageMinutes",
              COUNT(*)::int AS "count"
       FROM problems
       WHERE user_id = $1`,
      [dbUserId]
    );
    const row = rows[0] || { averageMinutes: 0, count: 0 };
    return NextResponse.json({
      averageMinutes: Number(row.averageMinutes) || 0,
      count: Number(row.count) || 0,
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
