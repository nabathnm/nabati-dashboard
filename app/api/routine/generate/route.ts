import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { date, profile, existingTasks, previousCompletionRate } =
      await req.json();

    const apiKey = process.env.GROQ_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_KEY not configured in environment variables." },
        { status: 500 }
      );
    }

    // ─── Parse day of week ────────────────────────────────────
    const dayOfWeek = new Date(date)
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    // ─── College schedule for today ───────────────────────────
    const collegeForToday =
      (profile.college_schedule?.[dayOfWeek] as any[] | undefined) ?? [];

    // Build detailed class blocks with exact time
    const classBlocks = collegeForToday.length > 0
      ? collegeForToday
          .sort((a: any, b: any) => a.start_time.localeCompare(b.start_time))
          .map(
            (c: any) =>
              `  • ${c.start_time}–${c.end_time} | ${c.subject} @ ${c.room || "?"}`
          )
          .join("\n")
      : null;

    // Build forbidden time windows for AI (so it doesn't schedule OVER classes)
    const forbiddenWindows = collegeForToday
      .map((c: any) => `${c.start_time}–${c.end_time} (${c.subject})`)
      .join(", ");

    // Determine first class and last class times
    const sortedClasses = [...collegeForToday].sort((a: any, b: any) =>
      a.start_time.localeCompare(b.start_time)
    );
    const firstClassTime = sortedClasses[0]?.start_time ?? null;
    const lastClassEndTime =
      sortedClasses[sortedClasses.length - 1]?.end_time ?? null;

    // Find free time gaps between classes
    const gapBlocks: string[] = [];
    for (let i = 0; i < sortedClasses.length - 1; i++) {
      const gapStart = sortedClasses[i].end_time;
      const gapEnd = sortedClasses[i + 1].start_time;
      if (gapStart < gapEnd) {
        gapBlocks.push(
          `${gapStart}–${gapEnd} (free gap between ${sortedClasses[i].subject} and ${sortedClasses[i + 1].subject})`
        );
      }
    }

    // ─── Org schedule for today ───────────────────────────────
    const orgForToday = profile.organization_schedule?.[dayOfWeek] ?? null;

    // ─── Tasks: upcoming (next 3 days) + today ────────────────
    const upcomingTasks = (existingTasks ?? [])
      .filter((t: any) => t.due_date)
      .sort((a: any, b: any) => a.due_date.localeCompare(b.due_date));

    const dueTodayTasks = upcomingTasks.filter((t: any) =>
      t.due_date.startsWith(date)
    );
    const urgentTasks = upcomingTasks.filter((t: any) => {
      const diff =
        (new Date(t.due_date).getTime() - new Date(date).getTime()) /
        (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 3;
    });

    const tasksContext = [
      dueTodayTasks.length > 0
        ? `DUE TODAY:\n${dueTodayTasks
            .map(
              (t: any) =>
                `  • ${t.title}${t.category ? ` [${t.category}]` : ""}${t.description ? `\n    Details: ${t.description}` : ""}`
            )
            .join("\n")}`
        : "",
      urgentTasks.length > 0
        ? `UPCOMING (next 3 days):\n${urgentTasks
            .map(
              (t: any) =>
                `  • ${t.title} (due ${t.due_date})${t.category ? ` [${t.category}]` : ""}${t.description ? `\n    Details: ${t.description}` : ""}`
            )
            .join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    // ─── Schedule context ─────────────────────────────────────
    const wakeUp = profile.sleep_end || "05:00";
    const sleepTime = profile.sleep_start || "22:00";
    const energyPref = profile.energy_preference || "morning";

    const scheduleContext = [
      `Wake up: ${wakeUp} | Sleep: ${sleepTime}`,
      `Peak energy: ${energyPref}`,
      classBlocks
        ? `College classes:\n${classBlocks}`
        : "No college classes today (free day).",
      forbiddenWindows
        ? `DO NOT schedule anything during: ${forbiddenWindows}`
        : "",
      gapBlocks.length > 0
        ? `Free time gaps between classes: ${gapBlocks.join("; ")}`
        : "",
      orgForToday ? `Organization schedule: ${orgForToday}` : "",
      firstClassTime
        ? `Pre-class morning block available: ${wakeUp}–${firstClassTime}`
        : "",
      lastClassEndTime
        ? `Post-class afternoon/evening block available: ${lastClassEndTime}–${sleepTime}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    // ─── Goals context ────────────────────────────────────────
    const goalsContext =
      profile.goals && profile.goals.length > 0
        ? profile.goals.map((g: string) => `  • ${g}`).join("\n")
        : "No specific goals set.";

    // ─── Completion rate context ──────────────────────────────
    const completionContext =
      previousCompletionRate < 50
        ? "User has been struggling (low completion). Create a LIGHTER schedule: 8-10 items max, shorter durations."
        : previousCompletionRate < 75
        ? "User completes most routines. Maintain moderate intensity: 10-13 items."
        : "User is doing great. Can include challenging/growth activities: 12-15 items.";

    // ─── Prompts ──────────────────────────────────────────────
    const systemPrompt = `You are an AI Life Assistant that creates realistic, highly personalized daily routines for an active Muslim student. You MUST respond with ONLY a valid JSON object — no markdown, no explanation.

Core principles:
1. MANDATORY: Include the 5 daily Islamic prayers at appropriate times (Subuh ~04:30, Zuhur ~12:00, Asar ~15:30, Magrib ~18:00, Isya ~19:30).
2. NEVER schedule any activity that overlaps with the college class times provided. This is non-negotiable.
3. Use FREE GAP times between classes for short productive activities (review notes, light reading, prayer, snack).
4. Schedule high-cognitive tasks (studying, coding, projects) during the user's peak energy period.
5. If there are tasks due today or urgently, allocate specific focused study/work sessions for them.
6. Include realistic transitions and buffer time between activities.
7. Balance all 4 pillars: health (exercise, sleep), nutrition (meals), productivity (study/work), personal_growth (reflection, reading).
8. Be realistic — account for commute/travel time around class times.`;

    const userPrompt = `Create a personalized daily routine for ${date} (${dayOfWeek.toUpperCase()}).

TODAY'S SCHEDULE:
${scheduleContext}

USER GOALS:
${goalsContext}

TASKS TO CONSIDER:
${tasksContext || "No upcoming tasks or deadlines."}

SCHEDULING GUIDANCE:
Previous completion rate: ${previousCompletionRate}%
${completionContext}

INSTRUCTIONS:
- Sort all items by scheduled_time ascending (earliest first).
- Use exact times (e.g. "06:00", "14:30") — NOT ranges.
- Fill the day from wake-up (${wakeUp}) to sleep (${sleepTime}).
- In free gaps between classes, add SHORT activities (15-30 min): quick prayer, snack, review notes.
- After the last class (${lastClassEndTime || "evening"}), add productive study/exercise/personal growth sessions.
${
  dueTodayTasks.length > 0
    ? `- IMPORTANT: Allocate a dedicated focused study/work block specifically for: ${dueTodayTasks.map((t: any) => t.title).join(", ")}`
    : ""
}

Respond with ONLY this JSON:
{
  "routines": [
    {
      "title": "Activity name",
      "description": "Brief tip or description",
      "category": "health" | "nutrition" | "productivity" | "personal_growth" | "custom",
      "scheduled_time": "HH:MM",
      "estimated_duration": 30,
      "priority": 1
    }
  ]
}

Priority: 0=low, 1=medium, 2=high.`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
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
          temperature: 0.65,
          max_tokens: 4096,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to fetch from Groq API"
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
      throw new Error("Failed to parse JSON from AI response");
    }

    if (!resultJson.routines || !Array.isArray(resultJson.routines)) {
      throw new Error("AI response missing routines array");
    }

    return NextResponse.json(resultJson);
  } catch (error: any) {
    console.error("Routine generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate routine" },
      { status: 500 }
    );
  }
}
