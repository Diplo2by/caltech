import { getLoggingStreak } from "@/lib/db";
import { stackServerApp } from "@/stack";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const user = await stackServerApp.getUser();
        const userId = user.id;

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