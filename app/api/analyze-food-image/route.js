import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SUPPORTED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/gif",
];

export async function POST(req) {
    try {
        const { imageBase64, mimeType } = await req.json();

        if (!imageBase64) {
            return NextResponse.json(
                { error: "imageBase64 is required" },
                { status: 400 }
            );
        }

        if (!mimeType || !SUPPORTED_MIME_TYPES.includes(mimeType)) {
            return NextResponse.json(
                {
                    error: "Invalid or missing mimeType",
                    supported: SUPPORTED_MIME_TYPES,
                },
                { status: 400 }
            );
        }

        // Strip data URL prefix if the client sent a full data URI
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Missing GEMINI_API_KEY" },
                { status: 500 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            },
        });

        const prompt = `You are a nutrition expert analyzing a food image.

Identify all visible food items in the image and estimate their nutritional content.

Respond with valid JSON only using this exact structure:
{
  "detectedFoods": [
    {
      "name": string,
      "quantity": number,
      "unit": string,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ],
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFat": number,
  "confidence": "high" | "medium" | "low",
  "servingNotes": string
}

Guidelines:
- List every distinct food item visible as a separate entry in detectedFoods
- Choose the most appropriate unit: g, kg, ml, l, cup, tbsp, tsp, piece, slice
- Estimate realistic portion sizes based on visual cues (plate size, utensils, context)
- protein, carbs, fat are in grams
- IMPORTANT - Always return a valid json ONLY
- totalCalories/Protein/Carbs/Fat are the sum across all detected foods
- confidence: "high" if foods are clearly identifiable, "medium" if partially obscured, "low" if unclear
- servingNotes: one short sentence noting any assumptions (e.g. "Estimated as a standard restaurant portion")
- If no food is visible, return detectedFoods as an empty array and all totals as 0`;

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType,
                    data: base64Data,
                },
            },
            prompt,
        ]);

        const response = await result.response;
        const text = response.text();

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

        // Validate top-level structure
        const requiredFields = [
            "detectedFoods",
            "totalCalories",
            "totalProtein",
            "totalCarbs",
            "totalFat",
            "confidence",
            "servingNotes",
        ];

        for (const field of requiredFields) {
            if (parsed[field] === undefined || parsed[field] === null) {
                return NextResponse.json(
                    { error: "Invalid response format", missing: field },
                    { status: 500 }
                );
            }
        }

        if (!Array.isArray(parsed.detectedFoods)) {
            return NextResponse.json(
                { error: "detectedFoods must be an array" },
                { status: 500 }
            );
        }

        // Normalise numeric precision on each detected food
        const detectedFoods = parsed.detectedFoods.map((item) => ({
            name: String(item.name ?? "Unknown"),
            quantity: Math.round(item.quantity ?? 0),
            unit: String(item.unit ?? "g"),
            calories: Math.round(item.calories ?? 0),
            protein: Math.round((item.protein ?? 0) * 10) / 10,
            carbs: Math.round((item.carbs ?? 0) * 10) / 10,
            fat: Math.round((item.fat ?? 0) * 10) / 10,
        }));

        return NextResponse.json({
            detectedFoods,
            totalCalories: Math.round(parsed.totalCalories),
            totalProtein: Math.round(parsed.totalProtein * 10) / 10,
            totalCarbs: Math.round(parsed.totalCarbs * 10) / 10,
            totalFat: Math.round(parsed.totalFat * 10) / 10,
            confidence: parsed.confidence,
            servingNotes: parsed.servingNotes,
        });
    } catch (error) {
        console.error("Gemini vision API error:", error);
        return NextResponse.json(
            { error: "Unexpected error", details: error.message },
            { status: 500 }
        );
    }
}