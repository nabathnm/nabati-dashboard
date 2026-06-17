import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userProfile, stats } = await req.json();

    const apiKey = process.env.GROQ_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_KEY not configured" }, { status: 500 });
    }

    if (!userProfile || !stats) {
      return NextResponse.json({ error: "Missing required GitHub data" }, { status: 400 });
    }

    const systemPrompt = `You are an expert Senior Software Engineer and Tech Recruiter evaluating a developer's GitHub profile.
You must respond ONLY with a valid JSON object. Do not include any markdown formatting outside the JSON object.

The JSON MUST follow this exact schema:
{
  "developer_score": number (0-100, based on consistency, repos, and activity),
  "career_readiness": {
    "frontend": number (0-100),
    "backend": number (0-100),
    "mobile": number (0-100),
    "fullstack": number (0-100)
  },
  "habit_analysis": string (max 2 sentences describing their coding rhythm),
  "portfolio_review": string[] (3-4 specific actionable tips to improve their repos),
  "learning_insights": string (guess what tech stack they are focusing on right now)
}`;

    const userPrompt = `Evaluate this developer's GitHub profile:
Username: ${userProfile.login}
Public Repos: ${userProfile.public_repos}
Followers: ${userProfile.followers}

Activity Stats (recent):
Total Stars: ${stats.totalStars}
Recent Commits: ${stats.recentCommitsCount}
Active Days: ${stats.activeDays}
Current Streak: ${stats.streak.current} days
Longest Streak: ${stats.streak.longest} days

Top Languages:
${stats.languages.map((l: any) => `- ${l.name}: ${Math.round(l.percentage)}%`).join("\n")}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from Groq API");
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;

    let resultJson;
    try {
      const cleanText = resultText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const startIdx = cleanText.indexOf("{");
      const endIdx = cleanText.lastIndexOf("}");
      resultJson = JSON.parse(cleanText.substring(startIdx, endIdx + 1));
    } catch {
      throw new Error("Failed to parse JSON from AI response");
    }

    return NextResponse.json(resultJson);
  } catch (error: any) {
    console.error("GitHub Evaluation error:", error);
    return NextResponse.json({ error: "Failed to generate evaluation" }, { status: 500 });
  }
}
