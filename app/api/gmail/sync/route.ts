import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { toTitleCase } from "@/lib/utils";

// ============================================================
// HELPER TYPES
// ============================================================

export interface ParsedTransaction {
  amount: number;
  type: "expense" | "income";
  description: string;
  date: string;
  emailId?: string;
  source?: string;
}

// ============================================================
// PHONE NUMBER DETECTOR
// ============================================================
function isPhoneNumber(str: string): boolean {
  const cleaned = str.replace(/[\s\-\.]/g, "");
  return /^(\+?62|0)[0-9]{8,13}$/.test(cleaned);
}

// ============================================================
// BRI NOTIFICATION BODY PARSER
// ============================================================
interface BriInfo {
  description: string;
  isGajian: boolean;
  transferTo?: string;
}

function parseBriBody(bodyText: string): BriInfo | null {
  const ketRegex = /Ket\.?:?\s*([^\r\n]+)/i;
  const ketMatch = bodyText.match(ketRegex);

  if (!ketMatch) return null;

  const ket = ketMatch[1].trim();

  // Check if salary transfer (KASTUM ABADI)
  if (/kastum\s*abadi/i.test(ket)) {
    const toMatch = ket.match(/\bto\s+(.+)$/i);
    const transferTo = toMatch ? toMatch[1].trim() : undefined;
    return { description: "Gajian", isGajian: true, transferTo };
  }

  // "NBMB SENDER TO RECIPIENT"
  const toMatch = ket.match(/^(.+?)\s+to\s+(.+)$/i);
  if (toMatch) {
    const recipient = toMatch[2].trim();
    return { description: ket, isGajian: false, transferTo: recipient };
  }

  const cleaned = ket.replace(/^nbmb\s+/i, "").trim();
  return { description: cleaned, isGajian: false };
}

// ============================================================
// DESCRIPTION NORMALIZER
// ============================================================
function normalizeDescription(
  description: string,
  bodyText: string,
  type: "expense" | "income"
): string {
  if (/siapapun termasuk petugas bri/i.test(description)) {
    const briInfo = parseBriBody(bodyText);
    if (briInfo) {
      if (briInfo.isGajian) return "Gajian";
      if (type === "expense" && briInfo.transferTo) {
        return `Transfer ke ${briInfo.transferTo}`;
      }
      return briInfo.description;
    }
    return type === "income" ? "Transfer Masuk" : "Transfer Keluar";
  }

  if (/\*+\d{4}(?:\s+pada\b.*)?/i.test(description)) {
    const briInfo = parseBriBody(bodyText);
    if (briInfo?.isGajian) return "Gajian";
    if (briInfo?.description) return briInfo.description;
    return "Gajian";
  }

  return description;
}

// ============================================================
// MAIN EMAIL PARSER
// ============================================================
export function parseEmail(
  subject: string,
  bodyText: string,
  emailDate: Date,
  emailId?: string
): ParsedTransaction | null {
  // 1. Amount extraction
  let amount = 0;
  const rpRegex =
    /(?:Rp|IDR|Nominal)\s*\.?\s*([0-9]+(?:[\.,][0-9]{3})*(?:[\.,][0-9]{2})?)/i;
  const matchRp = bodyText.match(rpRegex) || subject.match(rpRegex);

  if (matchRp) {
    let amtStr = matchRp[1];
    if (amtStr.endsWith(",00") || amtStr.endsWith(".00")) {
      amtStr = amtStr.slice(0, -3);
    }
    amount = parseFloat(amtStr.replace(/[\.,]/g, ""));
  }

  if (!amount || isNaN(amount)) {
    const totalRegex = /Total Transaksi[\s\r\n]+([0-9]+(?:[\.,][0-9]{3})*)/i;
    const matchTotal = bodyText.match(totalRegex);
    if (matchTotal) {
      amount = parseFloat(matchTotal[1].replace(/[\.,]/g, ""));
    }
  }

  if (!amount || isNaN(amount)) return null;

  // 2. Type: expense / income
  let type: "expense" | "income" = "expense";
  const incomeKeywords = [
    "diterima", "masuk", "incoming", "kredit", "credit",
    "transfer dari", "receive", "didapat", "diteruskan",
    "ditambahkan", "cash-in", "cashin",
  ];
  const combinedText = (subject + " " + bodyText).toLowerCase();
  if (incomeKeywords.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(combinedText))) {
    type = "income";
  }

  // 3. Description extraction
  let description = "";
  const briMerchantRegex = /Nama Merchant[ \t]*:?[ \t]*([^\r\n]+)/i;
  const briTujuanRegex = /Tujuan[\s\r\n]+(?:\[image:[^\]]+\][\s\r\n]+)?(?:Product\.png[\s\r\n]+)?([^\r\n]+)/i;
  const briTransferRegex = /(?:Ke Rekening|Kepada)[ \t]*:?[ \t]*([^\r\n]+)/i;
  const briJenisRegex = /Jenis Transaksi[ \t]*:?[ \t]*([^\r\n]+)/i;
  const briKetRegex = /Ket\.?[ \t]*:?[ \t]*([^\r\n]+)/i;

  if (briMerchantRegex.test(bodyText)) {
    description = bodyText.match(briMerchantRegex)![1].trim();
  } else if (briTujuanRegex.test(bodyText)) {
    description = bodyText.match(briTujuanRegex)![1].trim();
  } else if (briTransferRegex.test(bodyText)) {
    description = bodyText.match(briTransferRegex)![1].trim();
  } else if (briJenisRegex.test(bodyText)) {
    description = bodyText.match(briJenisRegex)![1].trim();
  } else if (briKetRegex.test(bodyText)) {
    description = bodyText.match(briKetRegex)![1].trim();
  } else if (/shopeepay/i.test(subject) || /shopeepay/i.test(bodyText)) {
    description = "ShopeePay";
  } else {
    const genericRegex =
      /(?:merchant|ke|penerima|ke tujuan|destination|recipient|payee|merchant name|beli di|keterangan)[ \t]*:?[ \t]*([^\r\n]+)/i;
    const matchGeneric = bodyText.match(genericRegex);
    description = matchGeneric
      ? matchGeneric[1].trim()
      : subject.replace(/[\r\n]+/g, " ").trim();
  }

  description = description.replace(/fwd:/i, "").trim();
  if (description.length > 255) description = description.slice(0, 252) + "...";

  description = normalizeDescription(description, bodyText, type);
  description = toTitleCase(description);

  // 4. Date extraction
  let dateStr = emailDate.toISOString().split("T")[0];

  const dateRegex1 = /(?:Tanggal Transaksi|Tanggal)[ \t]*:?[ \t]*([0-9]{1,2} [A-Za-z]+ [0-9]{4})/i;
  const dateRegex2 = /(?:Tanggal Transaksi|Tanggal)[ \t]*:?[ \t]*([0-9]{2}[\/\-][0-9]{2}[\/\-][0-9]{4})/i;

  const matchDate1 = bodyText.match(dateRegex1);
  const matchDate2 = bodyText.match(dateRegex2);

  if (matchDate1) {
    const d = new Date(matchDate1[1]);
    if (!isNaN(d.getTime())) dateStr = d.toISOString().split("T")[0];
  } else if (matchDate2) {
    const parts = matchDate2[1].split(/[\/\-]/);
    if (parts.length === 3) dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return {
    amount,
    type,
    description,
    date: dateStr,
    emailId,
    source: "Gmail (Bank Notification)",
  };
}

// ============================================================
// CATEGORY KEYWORDS & MATCHER
// ============================================================
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Kopi: [
    "coffee", "cafe", "kopi", "espresso", "latte",
    "cappuccino", "barista", "brewhouse", "coffeehouse",
    "jam tujuh", "sarijan", "cs coffee", "tweehander",
    "medcafe", "umayumcha", "boba", "bubble tea",
  ],
  Makanan: [
    "food", "makan", "resto", "restaurant", "warung", "kantin",
    "starbucks", "mcdonald", "kfc", "pizza", "burger",
    "gofood", "grabfood", "sop", "ayam", "bakso", "geprek",
    "padang", "macaroni", "sambel", "nasi", "mie", "bakmie",
    "seafood", "sate", "pecel", "rawon", "soto",
    "rm ", "roda baru", "esb restaurant", "esb rest",
    "lesehan", "cincau", "aiciro",
  ],
  Transportasi: [
    "gojek", "goride", "gocar", "grab", "uber", "taxi",
    "mrt", "lrt", "krl", "kereta", "bus",
    "pertamina", "shell", "bensin", "spbu", "bbm",
    "toll", "tol", "parkir", "flight", "tiket",
  ],
  Belanja: [
    "shopee", "tokopedia", "lazada", "blibli",
    "supermarket", "indomaret", "alfamart", "hypermart", "transmart",
    "mall", "fashion", "baju", "pakaian", "sepatu",
    "toko ",
  ],
  Tagihan: [
    "listrik", "pln", "pdam", "wifi", "internet",
    "indihome", "telkomsel", "xl ", "tri ", "axis",
    "pulsa", "bpjs", "asuransi", "insurance",
    "pajak", "tagihan", "cicilan", "angsuran",
    "seabank", "bank bri", "transfer ke",
  ],
  Hiburan: [
    "netflix", "spotify", "disney", "youtube premium",
    "bioskop", "cgv", "xxi", "cinema", "game", "steam",
  ],
  Kesehatan: [
    "apotek", "apotik", "rumah sakit", "klinik",
    "dokter", "obat", "kimia farma", "k24", "puskesmas", "rs ",
  ],
  Pendidikan: [
    "sekolah", "kampus", "spp", "kursus", "buku", "gramedia", "kuliah",
    "fotocopy", "fotokopi", "print", "alat tulis",
  ],
  Perawatan: [
    "barbershop", "barber", "salon", "spa", "pangkas", "skincare",
  ],
};

const MATCH_ORDER = [
  "Kopi", "Makanan", "Transportasi", "Belanja",
  "Tagihan", "Hiburan", "Kesehatan", "Pendidikan", "Perawatan",
];

export function matchCategoryId(
  description: string,
  categories: { id: string; name: string; type: string }[],
  type: "expense" | "income"
): string | undefined {
  const typedCategories = categories.filter((c) => c.type === type);

  if (type === "income") {
    return (
      typedCategories.find((c) => c.name.toLowerCase().includes("pemasukan"))?.id ||
      typedCategories[0]?.id
    );
  }

  const descLower = description.toLowerCase().trim();

  if (isPhoneNumber(description)) {
    return (
      typedCategories.find((c) => c.name.toLowerCase().includes("tagihan"))?.id ||
      typedCategories.find((c) => c.name.toLowerCase().includes("lainnya"))?.id
    );
  }

  for (const catName of MATCH_ORDER) {
    const keywords = CATEGORY_KEYWORDS[catName] ?? [];
    if (keywords.some((kw) => descLower.includes(kw.toLowerCase()))) {
      const cat = typedCategories.find((c) =>
        c.name.toLowerCase().includes(catName.toLowerCase())
      );
      if (cat) return cat.id;
    }
  }

  return (
    typedCategories.find((c) => c.name.toLowerCase().includes("lainnya"))?.id ||
    typedCategories[0]?.id
  );
}

// ============================================================
// ROUTE HANDLER: POST /api/gmail/sync
// ============================================================
export async function POST(req: Request) {
  try {
    const appsScriptUrl =
      process.env.APPS_SCRIPT_URL ||
      "https://script.google.com/macros/s/AKfycbxTEKBLQpTg7BRBNUtUMm1o2Jd-ODMUpxlBYzLXMiGaR_ltVxRqDc9m4BSpVINkh-7bPQ/exec";

    // 1. Fetch raw emails from Google Apps Script / Gmail connector
    const response = await fetch(appsScriptUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script error! status: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Gagal mengambil data dari Google Apps Script");
    }

    const rawEmails: any[] = result.data || [];
    const parsedTransactions: ParsedTransaction[] = [];

    // 2. Parse banking emails
    for (const msg of rawEmails) {
      const emailDate = new Date(msg.date);
      const parsed = parseEmail(msg.subject || "", msg.bodyText || "", emailDate, msg.id);
      if (parsed) {
        parsedTransactions.push(parsed);
      }
    }

    // 3. Connect Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    let syncedCount = 0;
    const insertedItems: any[] = [];

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check current user session if token is provided in header
      const authHeader = req.headers.get("authorization");
      let userId: string | null = null;

      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        const { data: userData } = await supabase.auth.getUser(token);
        userId = userData?.user?.id || null;
      }

      // If no auth token in request, get first user or public active account
      let targetAccountId: string | null = null;
      let targetAccountBalance = 0;

      const { data: accounts } = await supabase
        .from("accounts")
        .select("*")
        .limit(5);

      if (accounts && accounts.length > 0) {
        const primaryAccount =
          accounts.find((a) =>
            a.name?.toLowerCase().includes("main") ||
            a.name?.toLowerCase().includes("bri") ||
            a.name?.toLowerCase().includes("bank")
          ) || accounts[0];

        targetAccountId = primaryAccount.id;
        targetAccountBalance = Number(primaryAccount.balance || 0);
        if (!userId) {
          userId = primaryAccount.user_id;
        }
      }

      // Fetch transaction categories for matching
      const { data: categories } = await supabase
        .from("transaction_categories")
        .select("id, name, type");
      const categoryList = categories || [];

      // 4. Insert each transaction with duplicate prevention
      for (const tx of parsedTransactions) {
        if (!targetAccountId) break;

        let duplicateQuery = supabase
          .from("transactions")
          .select("id")
          .eq("amount", tx.amount)
          .eq("type", tx.type)
          .eq("transaction_date", tx.date)
          .limit(1);

        if (userId) {
          duplicateQuery = duplicateQuery.eq("user_id", userId);
        }

        const { data: existing } = await duplicateQuery;

        if (!existing || existing.length === 0) {
          const categoryId = matchCategoryId(tx.description, categoryList, tx.type);

          const newTxPayload: any = {
            account_id: targetAccountId,
            type: tx.type,
            amount: tx.amount,
            merchant: tx.description,
            note: "Synced from Gmail",
            transaction_date: tx.date,
            category_id: categoryId || null,
          };

          if (userId) {
            newTxPayload.user_id = userId;
          }

          const { data: inserted, error: insertError } = await supabase
            .from("transactions")
            .insert(newTxPayload)
            .select()
            .single();

          if (!insertError && inserted) {
            syncedCount++;
            insertedItems.push(inserted);

            // Update account balance
            if (tx.type === "income") {
              targetAccountBalance += tx.amount;
            } else if (tx.type === "expense") {
              targetAccountBalance -= tx.amount;
            }

            await supabase
              .from("accounts")
              .update({ balance: targetAccountBalance })
              .eq("id", targetAccountId);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memproses ${rawEmails.length} email. ${syncedCount} transaksi baru disinkronkan.`,
      syncedCount,
      totalScanned: rawEmails.length,
      parsedTransactions,
      insertedTransactions: insertedItems,
    });
  } catch (error: any) {
    console.error("Gmail sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal menyinkronkan transaksi dari Gmail",
      },
      { status: 500 }
    );
  }
}

// GET endpoint for debugging or status check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Gmail Transaction Sync Service",
    provider: "Google Apps Script Connector",
    endpoint: process.env.APPS_SCRIPT_URL ? "Configured" : "Default Built-in",
  });
}
