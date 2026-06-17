import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { income, expense, categorySpending, previousMonthExpense, month, year } = await req.json();
    
    const apiKey = process.env.GROQ_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_KEY not configured in environment variables." }, { status: 500 });
    }

    const systemPrompt = `You are an expert AI financial advisor. You must respond ONLY with a valid JSON object matching the requested schema. Do not include any explanation or markdown formatting like \`\`\`json outside the JSON object.`;

    const userPrompt = `
Analyze the following financial data for a user for month ${month}/${year}:
- Income: Rp ${income}
- Expense: Rp ${expense}
- Previous Month Expense: Rp ${previousMonthExpense}
- Spending by Category:
${categorySpending.map((c: any) => `  - ${c.category}: Rp ${c.amount} (${c.percentage.toFixed(1)}%)`).join("\n")}

Respond with a JSON object following this exact schema:
{
  "financial_score": 85, // number from 0 to 100 based on financial health
  "summary": "Short 1-2 sentence summary of the month's financial health in Indonesian.",
  "insights": [
    {
      "category": "Category name (e.g., Food, Transport) or 'Overall'",
      "message": "Actionable insight or observation in Indonesian.",
      "severity": "info" // can be 'info', 'warning', 'critical', or 'positive'
    }
  ],
  "recommendations": [
    "Actionable recommendation 1 in Indonesian.",
    "Actionable recommendation 2 in Indonesian."
  ]
}

Provide at least 2-3 insights and 2-4 actionable recommendations. Ensure all text values (summary, message, recommendations) are in Indonesian (Bahasa Indonesia) as the user is in Indonesia.
`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to fetch from Groq API");
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;
    
    if (!resultText) {
      throw new Error("Invalid response format from Groq");
    }

    let resultJson;
    try {
      const cleanText = resultText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      // Find the first { and last }
      const startIdx = cleanText.indexOf('{');
      const endIdx = cleanText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        resultJson = JSON.parse(cleanText.substring(startIdx, endIdx + 1));
      } else {
        resultJson = JSON.parse(cleanText);
      }
    } catch (e) {
      throw new Error("Failed to parse JSON from AI response");
    }

    return NextResponse.json(resultJson);
  } catch (error: any) {
    console.error("AI Evaluation generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI evaluation" },
      { status: 500 }
    );
  }
}
