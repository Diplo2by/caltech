import { getMacroDistribution } from "@/lib/db";
import { getUserId } from "@/util/scripts";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const userId = getUserId(request);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days")) || 7;

        const data = await getMacroDistribution(userId, days);
        return NextResponse.json({ data });
    } catch (error) {
        console.error("GET /api/trends/macros error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}