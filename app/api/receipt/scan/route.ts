import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "No image provided." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_KEY not configured in environment variables." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert AI Receipt Scanner and Data Extractor. 
Your task is to analyze the provided receipt image and extract the following information:
1. "merchant": The name of the store or merchant.
2. "date": The date of the transaction if visible (YYYY-MM-DD), otherwise null.
3. "total": The total amount of the receipt (as a number).
4. "items": An array of individual items purchased. For each item, provide:
   - "name": The name or description of the item.
   - "price": The price of the item (as a number).
   - "category_name": A suggested general category for this item (e.g., "Food & Beverage", "Personal Care", "Transportation", "Utilities", "Entertainment", "Shopping").

Respond ONLY with a valid JSON object matching this structure:
{
  "merchant": "string",
  "date": "string | null",
  "total": 0,
  "items": [
    { "name": "string", "price": 0, "category_name": "string" }
  ]
}

Do NOT include any markdown formatting, explanation, or text outside the JSON object. Just the JSON.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.2-90b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: systemPrompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.1, // Low temperature for more deterministic data extraction
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq Vision API Error:", errorData);
      throw new Error(
        errorData.error?.message || "Failed to fetch from Groq Vision API"
      );
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;

    if (!resultText) {
      throw new Error("Invalid response format from Groq");
    }

    let resultJson;
    try {
      const cleanText = resultText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const startIdx = cleanText.indexOf("{");
      const endIdx = cleanText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        resultJson = JSON.parse(cleanText.substring(startIdx, endIdx + 1));
      } else {
        resultJson = JSON.parse(cleanText);
      }
    } catch {
      console.error("Failed to parse JSON from AI response:", resultText);
      throw new Error("Failed to parse JSON from AI response");
    }

    return NextResponse.json(resultJson);
  } catch (error: any) {
    console.error("Receipt scanning error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process receipt",
      },
      { status: 500 }
    );
  }
}
