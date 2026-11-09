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
function parseEmail(
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

  // 4. Date & Time extraction
  const MONTH_MAP: Record<string, string> = {
    jan: "01", januari: "01",
    feb: "02", februari: "02",
    mar: "03", maret: "03",
    apr: "04", april: "04",
    mei: "05", may: "05",
    jun: "06", juni: "06",
    jul: "07", juli: "07",
    agu: "08", ags: "08", agustus: "08", aug: "08", august: "08",
    sep: "09", september: "09",
    okt: "10", oktober: "10", oct: "10", october: "10",
    nov: "11", november: "11",
    des: "12", desember: "12", dec: "12", december: "12",
  };

  let dateIso = emailDate && !isNaN(emailDate.getTime())
    ? emailDate.toISOString()
    : new Date().toISOString();

  // Pola 1: "02 Nov 2026, 12:19:39 WIB" atau "02 November 2026 12:19:39"
  const dtRegex1 = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})(?:,\s*|\s+)(\d{1,2}):(\d{2}):(\d{2})/i;
  const m1 = bodyText.match(dtRegex1);
  if (m1) {
    const day = m1[1].padStart(2, "0");
    const mKey = m1[2].toLowerCase();
    const month = MONTH_MAP[mKey];
    const year = m1[3];
    const hour = m1[4].padStart(2, "0");
    const min = m1[5];
    const sec = m1[6];
    if (month) {
      dateIso = `${year}-${month}-${day}T${hour}:${min}:${sec}+07:00`;
    }
  } else {
    // Pola 2: "pada 07/09/26 09:44:01"
    const dtRegex2 = /(\d{2})\/(\d{2})\/(\d{2,4})\s+(\d{2}):(\d{2}):(\d{2})/i;
    const m2 = bodyText.match(dtRegex2);
    if (m2) {
      const day = m2[1];
      const month = m2[2];
      let year = m2[3];
      if (year.length === 2) year = `20${year}`;
      const hour = m2[4];
      const min = m2[5];
      const sec = m2[6];
      dateIso = `${year}-${month}-${day}T${hour}:${min}:${sec}+07:00`;
    }
  }

  return {
    amount,
    type,
    description,
    date: dateIso,
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

    // 1. Ambil data mentah email dari Google Apps Script / Gmail connector
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

    // 2. Parsing email perbankan
    for (const msg of rawEmails) {
      const emailDate = new Date(msg.date);
      const parsed = parseEmail(msg.subject || "", msg.bodyText || "", emailDate, msg.id);
      if (parsed) {
        parsedTransactions.push(parsed);
      }
    }

    // 3. Ekstrak kredensial otorisasi Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    let token: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    const body = await req.json().catch(() => ({}));

    let syncedCount = 0;
    const insertedItems: any[] = [];
    const errors: string[] = [];

    if (supabaseUrl && supabaseKey) {
      // Inisialisasi Supabase client dengan token JWT pengguna untuk mematuhi RLS
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      });

      let userId: string | null = null;

      if (token) {
        const { data: userData } = await supabase.auth.getUser(token);
        userId = userData?.user?.id || null;
      }

      if (!userId && body?.userId) {
        userId = body.userId;
      }

      // Jika user tidak terautentikasi sama sekali, kembalikan parsed data tapi beri tahu frontend
      if (!userId) {
        return NextResponse.json(
          {
            success: false,
            error: "Sesi autentikasi tidak ditemukan. Silakan login ke aplikasi Nabatu terlebih dahulu.",
            totalScanned: rawEmails.length,
            parsedTransactions,
            syncedCount: 0,
          },
          { status: 401 }
        );
      }

      // 4. Cari atau inisialisasi akun transaksi pengguna
      let targetAccountId: string | null = body?.accountId || null;

      if (targetAccountId) {
        const { data: accCheck } = await supabase
          .from("accounts")
          .select("id")
          .eq("id", targetAccountId)
          .eq("user_id", userId)
          .maybeSingle();

        if (!accCheck) {
          targetAccountId = null;
        }
      }

      if (!targetAccountId) {
        const { data: userAccounts } = await supabase
          .from("accounts")
          .select("id, name, type")
          .eq("user_id", userId);

        if (userAccounts && userAccounts.length > 0) {
          const primaryAccount =
            userAccounts.find((a) =>
              a.name?.toLowerCase().includes("main") ||
              a.name?.toLowerCase().includes("bri") ||
              a.name?.toLowerCase().includes("bank")
            ) || userAccounts[0];

          targetAccountId = primaryAccount.id;
        } else {
          // Buat akun bawaan jika pengguna belum memiliki akun di tabel accounts
          const { data: createdAcc, error: createAccErr } = await supabase
            .from("accounts")
            .insert({
              user_id: userId,
              name: "Main Balance (Bank BRI)",
              type: "bank",
              institution: "BRI",
              is_active: true,
            })
            .select("id")
            .single();

          if (createdAcc?.id) {
            targetAccountId = createdAcc.id;
          } else {
            console.error("[Gmail Sync] Gagal membuat akun default:", createAccErr);
            errors.push("Gagal membuat akun transaksi default.");
          }
        }
      }

      // 5. Ambil atau inisialisasi kategori transaksi
      const { data: categories, error: catFetchErr } = await supabase
        .from("transaction_categories")
        .select("id, name, type")
        .or(`user_id.eq.${userId},is_default.eq.true`);

      let categoryList = categories || [];

      // Gabungkan kategori yang dikirim dari client frontend jika ada
      if (Array.isArray(body?.categories) && body.categories.length > 0) {
        for (const cat of body.categories) {
          if (cat.id && !categoryList.some((c) => c.id === cat.id)) {
            categoryList.push(cat);
          }
        }
      }

      if (categoryList.length === 0) {
        const defaultCategories = [
          { name: "Makanan & Minuman", type: "expense", is_default: false, user_id: userId },
          { name: "Kopi & Nongkrong", type: "expense", is_default: false, user_id: userId },
          { name: "Transportasi", type: "expense", is_default: false, user_id: userId },
          { name: "Belanja", type: "expense", is_default: false, user_id: userId },
          { name: "Tagihan & Utilitas", type: "expense", is_default: false, user_id: userId },
          { name: "Hiburan", type: "expense", is_default: false, user_id: userId },
          { name: "Kesehatan", type: "expense", is_default: false, user_id: userId },
          { name: "Pendidikan", type: "expense", is_default: false, user_id: userId },
          { name: "Gaji & Pemasukan", type: "income", is_default: false, user_id: userId },
          { name: "Pemasukan Lainnya", type: "income", is_default: false, user_id: userId },
          { name: "Lainnya", type: "expense", is_default: false, user_id: userId },
        ];

        const { data: insertedCats, error: insertCatErr } = await supabase
          .from("transaction_categories")
          .insert(defaultCategories)
          .select("id, name, type");

        if (insertCatErr) {
          console.error("[Gmail Sync] Error inserting default categories:", {
            message: insertCatErr.message,
            code: insertCatErr.code,
            details: insertCatErr.details,
          });
        } else if (insertedCats && insertedCats.length > 0) {
          categoryList = insertedCats;
        }
      }

      // 6. Masukkan setiap transaksi dengan pencegahan duplikasi yang ketat
      for (const tx of parsedTransactions) {
        if (!targetAccountId) {
          errors.push("Akun transaksi belum siap untuk menyimpan data.");
          break;
        }

        try {
          // A. Cek duplikasi via external_id (id email unik dari Apps Script) atau dedupe_key
          let isDuplicate = false;

          if (tx.emailId) {
            const { data: dupByExt } = await supabase
              .from("transactions")
              .select("id")
              .eq("user_id", userId)
              .or(`external_id.eq.${tx.emailId},dedupe_key.eq.gmail_${tx.emailId}`)
              .limit(1);

            if (dupByExt && dupByExt.length > 0) {
              isDuplicate = true;
            }
          }

          // B. Fallback cek duplikasi via amount, type, dan merchant jika external_id belum tercatat
          if (!isDuplicate) {
            const { data: dupByAttrs } = await supabase
              .from("transactions")
              .select("id")
              .eq("user_id", userId)
              .eq("amount", Math.round(tx.amount))
              .eq("type", tx.type)
              .eq("merchant", tx.description)
              .limit(1);

            if (dupByAttrs && dupByAttrs.length > 0) {
              isDuplicate = true;
            }
          }

          if (isDuplicate) {
            continue;
          }

          // Tentukan ID kategori (wajib ada karena database trigger 'Income and expense require a category')
          let categoryId = matchCategoryId(tx.description, categoryList, tx.type);

          if (!categoryId) {
            const fallbackCat = categoryList.find((c) => c.type === tx.type) || categoryList[0];
            categoryId = fallbackCat?.id;
          }

          // Jika masih belum ada kategori sama sekali di database, buat kategori darurat
          if (!categoryId) {
            const emergencyName = tx.type === "income" ? "Pemasukan" : "Lainnya";
            const { data: emergencyCat, error: emCatErr } = await supabase
              .from("transaction_categories")
              .insert({
                user_id: userId,
                name: emergencyName,
                type: tx.type,
                is_default: false,
              })
              .select("id, name, type")
              .single();

            if (emergencyCat) {
              categoryId = emergencyCat.id;
              categoryList.push(emergencyCat);
            } else {
              console.error("[Gmail Sync] Failed to create emergency category:", {
                message: emCatErr?.message,
                code: emCatErr?.code,
                details: emCatErr?.details,
              });
            }
          }

          if (!categoryId) {
            errors.push(`Kategori tidak dapat ditentukan untuk transaksi "${tx.description}".`);
            continue;
          }

          const newTxPayload = {
            user_id: userId,
            account_id: targetAccountId,
            category_id: categoryId,
            type: tx.type,
            amount: Math.round(tx.amount),
            currency: "IDR",
            merchant: tx.description,
            note: "Synced from Gmail (Bank Notification)",
            transaction_date: tx.date,
            source: "email",
            external_id: tx.emailId || null,
            dedupe_key: tx.emailId ? `gmail_${tx.emailId}` : null,
            review_status: "confirmed",
          };

          let { data: inserted, error: insertError } = await supabase
            .from("transactions")
            .insert(newTxPayload)
            .select()
            .single();

          // Fallback jika database memiliki constraint transactions_check (misal mewajibkan email_message_id saat source='email')
          if (insertError && (insertError.message?.includes("transactions_check") || insertError.details?.includes("transactions_check"))) {
            console.warn(`[Gmail Sync] Constraint transactions_check terpicu untuk "${tx.description}". Mencoba insert ulang dengan source='manual'...`);
            const fallbackPayload = {
              ...newTxPayload,
              source: "manual",
            };
            const retryRes = await supabase
              .from("transactions")
              .insert(fallbackPayload)
              .select()
              .single();

            if (!retryRes.error && retryRes.data) {
              inserted = retryRes.data;
              insertError = null;
            } else if (retryRes.error) {
              // Jika masih gagal, coba payload minimal yang valid
              const minimalPayload = {
                user_id: userId,
                account_id: targetAccountId,
                category_id: categoryId,
                type: tx.type,
                amount: Math.round(tx.amount),
                currency: "IDR",
                merchant: tx.description,
                note: "Synced from Gmail",
                transaction_date: tx.date,
                source: "manual",
                review_status: "confirmed",
              };
              const retryRes2 = await supabase
                .from("transactions")
                .insert(minimalPayload)
                .select()
                .single();

              if (!retryRes2.error && retryRes2.data) {
                inserted = retryRes2.data;
                insertError = null;
              } else {
                insertError = retryRes2.error || retryRes.error;
              }
            }
          }

          if (insertError) {
            console.error(`[Gmail Sync] Insert error for "${tx.description}":`, {
              message: insertError.message,
              code: insertError.code,
              details: insertError.details,
              hint: insertError.hint,
              categoryId: newTxPayload.category_id,
              accountId: newTxPayload.account_id,
            });
            errors.push(`Gagal menyimpan "${tx.description}": ${insertError.message}`);
          } else if (inserted) {
            syncedCount++;
            insertedItems.push(inserted);
          }
        } catch (itemErr: unknown) {
          const msg = itemErr instanceof Error ? itemErr.message : "Gagal memproses item transaksi.";
          errors.push(msg);
        }
      }
    }

    // Jika seluruh transaksi gagal disimpan dan ada error
    if (syncedCount === 0 && errors.length > 0 && parsedTransactions.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Gagal menyimpan transaksi ke database Supabase: ${errors[0]}`,
          syncedCount: 0,
          totalScanned: rawEmails.length,
          parsedTransactions,
          insertedTransactions: [],
          errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memproses ${rawEmails.length} email. ${syncedCount} transaksi baru disinkronkan ke Supabase.`,
      syncedCount,
      totalScanned: rawEmails.length,
      parsedTransactions,
      insertedTransactions: insertedItems,
      errors: errors.length > 0 ? errors : undefined,
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
