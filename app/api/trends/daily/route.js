import { getDailyTotals, getLastNDaysTotals } from "@/lib/db";
import { stackServerApp } from "@/stack";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const user = await stackServerApp.getUser();
        const userId = user.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days")) || 7;
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        let data;
        if (startDate && endDate) {
            data = await getDailyTotals(userId, startDate, endDate);
        } else {
            data = await getLastNDaysTotals(userId, days);
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("GET /api/trends/daily error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}