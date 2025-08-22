import { NextResponse } from "next/server";
import { ensureInitialized, pool } from "@/lib/db";

export async function GET() {
  try {
    await ensureInitialized();
    const { rows } = await pool.query(
      `SELECT COALESCE(AVG(minutes_to_solve), 0) AS "averageMinutes",
              COUNT(*)::int AS "count"
       FROM problems`
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
