import { getFoodEntries, createFoodEntry, updateFoodEntry, deleteFoodEntry } from "@/lib/db";
import { getUserId } from "@/util/scripts";
import { NextResponse } from "next/server";

// GET - Fetch entries for a specific date
export async function GET(request) {
    try {
        const userId = getUserId(request);

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
        const userId = getUserId(request);
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
        const userId = getUserId(request);
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
        const userId = getUserId(request);
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