 import { google } from "@ai-sdk/google";
 import { generateObject } from "ai";
 import { type NextRequest, NextResponse } from "next/server";
 import { z } from "zod";
 import { createSupabaseServerClient } from "@/lib/supabase";
 
 // export const runtime = "edge";
 
 const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
 
 const TransaksiSchema = z.object({
   tipeTransaksi: z.enum(["pemasukan", "pengeluaran"]),
   nominal: z.number().int().positive(),
   kategori: z.string(),
   deskripsi: z.string(),
   tingkatUrgensi: z.enum(["rendah", "sedang", "tinggi"]),
   kelompokKeuangan: z.enum([
     "aset_lancar",
     "kewajiban_jangka_pendek",
     "pendapatan",
     "beban_operasional",
   ]),
 });
 
 export async function POST(request: NextRequest) {
   try {
     // Auth check
     const supabase = createSupabaseServerClient();
 
     if (!supabase) {
       return NextResponse.json(
         { error: "Server configuration error" },
         { status: 500 }
       );
     }
 
     const {
       data: { user },
       error: authError,
     } = await supabase.auth.getUser();
 
     if (authError || !user) {
       return NextResponse.json(
         { error: "Unauthorized" },
         { status: 401 }
       );
     }
 
     const body = (await request.json()) as { text?: string };
 
     if (!body.text?.trim()) {
       return NextResponse.json(
         { error: "Text is required", details: "Body harus berisi field text." },
         { status: 400 },
       );
     }
 
     const { object: dataTransaksi } = await generateObject({
       model: google(GEMINI_MODEL),
       schema: TransaksiSchema,
       system: [
         "Anda adalah akuntan profesional untuk UMKM Indonesia.",
         "Ubah transkrip bahasa Indonesia dan slang angka lokal ke nilai numerik yang tepat.",
         "Contoh: ceban = 10000, goceng = 5000, gocap = 50000, 50 rebu = 50000.",
         "Kembalikan data transaksi yang akurat, ringkas, dan konsisten dengan konteks bisnis.",
       ].join(" "),
       prompt: body.text,
     });
 
     const { data, error } = await supabase.from("transactions").insert({
       user_id: user.id,
       tipe_transaksi: dataTransaksi.tipeTransaksi,
       nominal: dataTransaksi.nominal,
       kategori: dataTransaksi.kategori,
       deskripsi: dataTransaksi.deskripsi,
       tingkat_urgensi: dataTransaksi.tingkatUrgensi,
       kelompok_keuangan: dataTransaksi.kelompokKeuangan,
     }).select().single();
 
     if (error) {
       console.error("Database insert error:", error);
       return NextResponse.json(
         { error: "Failed to save transaction" },
         { status: 500 }
       );
     }
 
     return NextResponse.json({
       success: true,
       data: {
         ...dataTransaksi,
         id: data.id,
         created_at: data.created_at,
       },
     });
   } catch (error) {
     const message = error instanceof Error ? error.message : "Unknown error";
 
     return NextResponse.json(
       {
         error: "Failed to parse ledger",
         details: message,
       },
       { status: 500 },
     );
   }
 }
