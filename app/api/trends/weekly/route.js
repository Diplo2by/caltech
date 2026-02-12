import { getWeeklyAverages } from "@/lib/db";
import { getUserId } from "@/util/scripts";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const userId = getUserId(request)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const weeks = parseInt(searchParams.get("weeks")) || 4;

        const data = await getWeeklyAverages(userId, weeks);
        return NextResponse.json({ data });
    } catch (error) {
        console.error("GET /api/trends/weekly error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}