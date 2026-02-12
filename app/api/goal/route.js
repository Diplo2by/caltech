import { getUserGoal, updateUserGoal, createUser } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUserId } from "@/util/scripts";


// GET - Fetch user's daily calorie goal
export async function GET(request) {
    try {
        const userId = getUserId(request)
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const goal = await getUserGoal(userId);
        return NextResponse.json({ goal });
    } catch (error) {
        console.error("GET /api/goal error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT - Update user's daily calorie goal
export async function PUT(request) {
    try {
        const userId = getUserId(request)

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Ensure user exists in database
        await createUser(userId, user.primaryEmail || "");

        const { goal } = await request.json();

        if (typeof goal !== 'number' || goal < 0) {
            return NextResponse.json({ error: "Valid goal required" }, { status: 400 });
        }

        const result = await updateUserGoal(userId, goal);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PUT /api/goal error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}