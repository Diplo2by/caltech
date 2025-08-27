import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        const { food } = await req.json()

        if (!food) {
            return NextResponse.json({ error: "Food name required" }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })
        }

        const prompt = `You are a bot which accepts food and quantity and returns nutional value. Give a nutritional breakdown for ${food}.
Respond with valid JSON only (no code fences, no markdown, no explanations).
Fields: calories (kcal), protein (g), carbs (g), fat (g).`

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        )

        if (!res.ok) {
            const errText = await res.text()
            return NextResponse.json(
                { error: "Gemini API error", details: errText },
                { status: res.status }
            )
        }

        const data = await res.json()
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || ""

        let parsed
        try {
            parsed = JSON.parse(rawText)
        } catch {
            return NextResponse.json(
                { error: "Failed to parse Gemini response", raw: rawText },
                { status: 500 }
            )
        }

        return NextResponse.json({ food, ...parsed })
    } catch (err) {
        return NextResponse.json(
            { error: "Unexpected error", details: String(err) },
            { status: 500 }
        )
    }
}
