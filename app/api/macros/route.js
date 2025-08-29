import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
    try {
        const { food } = await req.json();

        if (!food) {
            return NextResponse.json({ error: "Food name required" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
        }

        // Initialize the Google Generative AI client
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const prompt = `You are a nutrition bot that analyzes food and returns nutritional values. 

Analyze this food: "${food}"

Respond with valid JSON only containing these exact fields:
{
  "calories": number,
  "protein": number,
  "carbs": number, 
  "fat": number
}

Values should be reasonable estimates for a typical serving size. Numbers only, no units.`;

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return NextResponse.json(
                { error: "Failed to parse AI response", raw: text },
                { status: 500 }
            );
        }

        // Validate the response has required fields
        const requiredFields = ['calories', 'protein', 'carbs', 'fat'];
        for (const field of requiredFields) {
            if (typeof parsed[field] !== 'number') {
                return NextResponse.json(
                    { error: "Invalid response format", missing: field },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({
            food,
            calories: Math.round(parsed.calories),
            protein: Math.round(parsed.protein * 10) / 10, // Round to 1 decimal
            carbs: Math.round(parsed.carbs * 10) / 10,
            fat: Math.round(parsed.fat * 10) / 10,
        });

    } catch (error) {
        console.error("Gemini API error:", error);
        return NextResponse.json(
            { error: "Unexpected error", details: error.message },
            { status: 500 }
        );
    }
}