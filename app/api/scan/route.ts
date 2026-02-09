import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error: Missing API Key" },
      { status: 500 }
    );
  }

  try {
    const { image, stepTarget, usePro } = await req.json();

    if (!image || !stepTarget) {
      return NextResponse.json({ error: "Missing image or target" }, { status: 400 });
    }

    // Strip base64 prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const modelName = usePro ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    
    // Schema definition using @google/genai Type
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        matched: { type: Type.BOOLEAN },
        confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1" },
        short_hint: { type: Type.STRING, description: "A very short directional hint (max 4 words)" },
        voice_line: { type: Type.STRING, description: "Spoken feedback for the user" },
        overlay_mode: { 
          type: Type.STRING, 
          enum: ['searching', 'almost', 'success']
        },
        next_step_unlocked: { type: Type.BOOLEAN }
      },
      required: ["matched", "confidence", "short_hint", "voice_line", "overlay_mode", "next_step_unlocked"]
    };

    const prompt = `
      Act as a strict scavenger hunt referee.
      The user is looking for: "${stepTarget}".
      Analyze the image. 
      Is the item clearly visible and dominant?
      If matched, be congratulatory.
      If not matched, provide a short hint based on visual feedback (e.g., "Too dark", "Get closer", "Not reflective enough").
      Return ONLY JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 128 }, // Minimal budget for low latency
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
       throw new Error("Empty response from Gemini");
    }

    // Parse just in case, though SDK usually handles it if schema is strict
    const parsed = JSON.parse(jsonText);
    
    return NextResponse.json(parsed);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process image" },
      { status: 500 }
    );
  }
}