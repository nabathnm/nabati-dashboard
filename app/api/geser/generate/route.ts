import { NextResponse } from "next/server";
import { MALANG_HANGOUT_SPOTS } from "@/data/malang-spots";
import { HangoutSpot } from "@/types/hangout";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { vibe = "all", budget = "all", customPrompt = "", count = 8 } = body;

    const apiKey = process.env.GROQ_KEY;

    // Filter fallback spots from curated dataset in case AI key is missing or fails
    let fallbackSpots = MALANG_HANGOUT_SPOTS;
    if (vibe && vibe !== "all") {
      fallbackSpots = fallbackSpots.filter((s) => s.vibe.includes(vibe));
      if (fallbackSpots.length < 4) {
        fallbackSpots = MALANG_HANGOUT_SPOTS;
      }
    }
    if (budget && budget !== "all") {
      const budgetMap: Record<string, string> = { cheap: "cheap", moderate: "moderate", premium: "premium" };
      if (budgetMap[budget]) {
        const filtered = fallbackSpots.filter((s) => s.priceLevel === budgetMap[budget]);
        if (filtered.length >= 4) {
          fallbackSpots = filtered;
        }
      }
    }
    // Shuffle and pick 6-8 spots
    const shuffledFallback = [...fallbackSpots].sort(() => 0.5 - Math.random()).slice(0, count || 8);

    if (!apiKey) {
      console.warn("GROQ_KEY not found in environment, returning curated Malang spots.");
      return NextResponse.json({
        spots: shuffledFallback,
        source: "curated_fallback",
      });
    }

    const systemPrompt = `You are a local Malang culinary & lifestyle AI expert with extensive knowledge of cafes, coffee shops, heritage spots, work spaces, and hangout places in Kota Malang, especially areas close to and surrounding Universitas Brawijaya (UB) campus (such as Jl. Soekarno-Hatta / Suhat, MT Haryono, Gajayana, Dinoyo, Bendungan Sigura-gura, Mayjen Panjaitan, Veteran, Sumbersari, Watugong, dll.) as well as iconic spots across Kota Malang and Batu.
You MUST respond with ONLY a valid JSON object matching the requested schema — no markdown backticks, no text outside the JSON.`;

    const userPrompt = `Rekomendasikan ${count || 8} tempat nongkrong (kafe/warkop/kedai/bistro/workspace) terbaik, terpopuler, dan estetik di Kota Malang yang UTAMANYA berlokasi DEKAT KAMPUS UNIVERSITAS BRAWIJAYA (UB) dan sekitarnya (seperti Suhat, Dinoyo, Panjaitan, Sigura-gura, Gajayana, Veteran, Sumbersari, dll.) yang SANGAT SPESIFIK dan NYATA.

KRITERIA PENCARIAN USER:
- Lokasi Utama: Dekat Kampus Universitas Brawijaya (UB) Malang dan sekitarnya
- Kategori / Vibe yang dicari: ${vibe === "all" ? "Semua suasana (campuran nugas, chill, heritage, aesthetic, night view)" : vibe}
- Preferensi Budget: ${budget === "all" ? "Semua rentang harga" : budget}
- Catatan / Mood Tambahan dari User: "${customPrompt ? `${customPrompt} (utamakan dekat kampus Universitas Brawijaya)` : "Cari tempat yang asik buat nongkrong santai atau nugas dekat kampus Universitas Brawijaya (UB) Malang"}"

DAFTAR TEMPAT POPULER SEKITAR UB & MALANG YANG BISA DIJADIKAN CONTOH / PILIHAN:
Nakoa Cafe Panjaitan/MT Haryono, Dialoogi Space & Coffee Suhat, Labore Native Coffee Suhat, DW Coffee Shop Bogor/Sumbersari, Kopi Titik Koma Dinoyo, Pesenkopi Plus Suhat, Vosco Coffee Dinoyo, Gartenhaus Lowokwaru, Kopi Lonceng Kayutangan, Bataputi Araya, Retawu Deli Ijen, Signora Pasta Galunggung, Koma Gelato Semeru, Mier Kitchen Dieng, dll.

Respond ONLY with this JSON schema:
{
  "spots": [
    {
      "id": "unique-slug-string",
      "name": "Nama Tempat Kafe",
      "tagline": "Deskripsi singkat 1 kalimat yang memikat",
      "vibe": ["nugas", "aesthetic", "heritage", "night_view", "budget_student", "nature_relax"],
      "area": "Nama Area/Jalan (contoh: Suhat, Kayutangan, Ijen, Batu, Dinoyo, Dieng)",
      "address": "Alamat lengkap di Kota Malang atau Batu",
      "priceLevel": "cheap" | "moderate" | "premium",
      "priceRange": "Rp 15.000 - Rp 35.000",
      "rating": 4.8,
      "reviewsCount": 1500,
      "openHours": "08:00 - 23:00",
      "mustTryMenu": ["Menu 1", "Menu 2", "Menu 3"],
      "features": ["WiFi Kencang", "Banyak Colokan", "Outdoor Sejuk", "Spot Foto"],
      "aiRecommendationReason": "Penjelasan AI 1-2 kalimat mengapa tempat ini sangat pas untuk mood user hari ini.",
      "mapQuery": "Nama+Tempat+Malang"
    }
  ]
}`;

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
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      console.warn("Groq API returned error status:", response.status, "using curated fallback.");
      return NextResponse.json({
        spots: shuffledFallback,
        source: "curated_fallback",
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        spots: shuffledFallback,
        source: "curated_fallback",
      });
    }

    let parsed;
    try {
      const cleanText = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const startIdx = cleanText.indexOf("{");
      const endIdx = cleanText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1) {
        parsed = JSON.parse(cleanText.substring(startIdx, endIdx + 1));
      } else {
        parsed = JSON.parse(cleanText);
      }
    } catch {
      return NextResponse.json({
        spots: shuffledFallback,
        source: "curated_fallback",
      });
    }

    if (!parsed.spots || !Array.isArray(parsed.spots) || parsed.spots.length === 0) {
      return NextResponse.json({
        spots: shuffledFallback,
        source: "curated_fallback",
      });
    }

    // Ensure valid fields
    const validSpots: HangoutSpot[] = parsed.spots.map((s: any, idx: number) => ({
      id: s.id || `spot-${idx}-${Date.now()}`,
      name: s.name || `Tempat Nongkrong #${idx + 1}`,
      tagline: s.tagline || "Tempat nongkrong asik di Malang",
      vibe: Array.isArray(s.vibe) ? s.vibe : ["aesthetic"],
      area: s.area || "Kota Malang",
      address: s.address || "Kota Malang, Jawa Timur",
      priceLevel: s.priceLevel || "moderate",
      priceRange: s.priceRange || "Rp 15.000 - Rp 45.000",
      rating: typeof s.rating === "number" ? s.rating : 4.8,
      reviewsCount: typeof s.reviewsCount === "number" ? s.reviewsCount : 1200,
      openHours: s.openHours || "10:00 - 23:00",
      mustTryMenu: Array.isArray(s.mustTryMenu) ? s.mustTryMenu : ["Signature Coffee", "Snack Platter"],
      features: Array.isArray(s.features) ? s.features : ["WiFi Nyaman", "Area Duduk Luas"],
      aiRecommendationReason: s.aiRecommendationReason || "Direkomendasikan AI untuk suasana nongkrong terbaik di Malang.",
      mapQuery: s.mapQuery || encodeURIComponent(s.name + " Malang"),
    }));

    return NextResponse.json({
      spots: validSpots,
      source: "ai_generated",
    });
  } catch (error: any) {
    console.error("Geser generation error:", error);
    // Graceful fallback to curated spots
    const fallbackSpots = [...MALANG_HANGOUT_SPOTS].sort(() => 0.5 - Math.random()).slice(0, 8);
    return NextResponse.json({
      spots: fallbackSpots,
      source: "curated_fallback",
    });
  }
}
