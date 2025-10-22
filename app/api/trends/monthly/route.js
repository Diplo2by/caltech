import { getMonthlySummary } from "@/lib/db";
import { getUserId } from "@/util/scripts";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const userId = getUserId(request);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year")) || new Date().getFullYear();
    const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;

    const data = await getMonthlySummary(userId, year, month);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/trends/monthly error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}