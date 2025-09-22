import { getLoggingStreak } from "@/lib/db";
import { getUserId } from "@/util/scripts";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const userId = getUserId(request)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const streak = await getLoggingStreak(userId);
        return NextResponse.json({ streak });
    } catch (error) {
        console.error("GET /api/trends/streak error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}