import { getFoodEntries, createFoodEntry, updateFoodEntry, deleteFoodEntry, createUser } from "@/lib/db";
import { stackServerApp } from "@/stack";
import { NextResponse } from "next/server";

// GET - Fetch entries for a specific date
export async function GET(request) {
    try {
        const user = await stackServerApp.getUser()
        const userId = user.id;
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date");

        if (!date) {
            return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
        }

        const entries = await getFoodEntries(userId, date);
        return NextResponse.json({ entries });
    } catch (error) {
        console.error("GET /api/entries error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST - Create new entry
export async function POST(request) {
    try {
        const user = await stackServerApp.getUser()
        const userId = user.id
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Ensure user exists in database
        await createUser(userId, user.primaryEmail || "");

        const body = await request.json();
        const result = await createFoodEntry(userId, body);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PUT - Update existing entry
export async function PUT(request) {
    try {
        const user = await stackServerApp.getUser()
        const userId = user.id
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { entryId, ...entry } = body;

        const result = await updateFoodEntry(userId, entryId, entry);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PUT /api/entries error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE - Delete entry
export async function DELETE(request) {
    try {
        const user = await stackServerApp.getUser()
        const userId = user.id
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const entryId = searchParams.get("id");

        if (!entryId) {
            return NextResponse.json({ error: "Entry ID required" }, { status: 400 });
        }

        const result = await deleteFoodEntry(userId, entryId);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/entries error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}