import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

export async function POST(req: NextRequest) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error: Missing API Key" },
      { status: 500 }
    );
  }

  try {
    const { image, numRiddles, usePro } = await req.json();

    if (!image || !numRiddles) {
      return NextResponse.json({ error: "Missing image or numRiddles" }, { status: 400 });
    }

    // Strip base64 prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const modelName = usePro ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
    
    // Schema for quest generation
    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        quest_steps: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              description: { type: SchemaType.STRING, description: "Short clue shown to user (e.g., 'Find something reflective')" },
              target: { type: SchemaType.STRING, description: "Detailed description for validation (e.g., 'reflective object like mirror, glass, or metal')" }
            },
            required: ["description", "target"]
          }
        }
      },
      required: ["quest_steps"]
    };

    const prompt = `
      You are a scavenger hunt game designer.
      Analyze this image of the user's environment.
      Create exactly ${numRiddles} creative and fun scavenger hunt riddles based on objects you can see.
      
      Requirements:
      - Choose diverse objects (colors, textures, materials, categories)
      - Make clues clear but slightly challenging
      - Order from easiest to hardest
      - Ensure objects are clearly visible in the environment
      - Avoid overly specific items that might not exist elsewhere in the room
      
      Examples:
      - "Find something with visible text" -> "object with visible text or writing"
      - "Find a reflective surface" -> "reflective object like mirror, glass, or metal"
      - "Find something soft" -> "soft or fabric object like pillow, cloth, or stuffed item"
      
      Return ONLY JSON with the quest steps.
    `;

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      }
    });

    const result = await model.generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
      { text: prompt }
    ]);

    const response = result.response;
    const jsonText = response.text();
    if (!jsonText) {
       throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(jsonText);
    
    // Add IDs to quest steps
    const questSteps = parsed.quest_steps.map((step: any, index: number) => ({
      id: index + 1,
      description: step.description,
      target: step.target
    }));
    
    return NextResponse.json({ quest_steps: questSteps });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate quest" },
      { status: 500 }
    );
  }
}
