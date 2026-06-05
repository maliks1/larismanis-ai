import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase";

// export const runtime = "edge";

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

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { text?: string };

    if (!body.text?.trim()) {
      return NextResponse.json(
        { error: "Text is required", details: "Body harus berisi field text." },
        { status: 400 },
      );
    }

    const { object: dataTransaksi } = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: TransaksiSchema,
      system: [
        "Anda adalah akuntan profesional untuk UMKM Indonesia.",
        "Ubah transkrip bahasa Indonesia dan slang angka lokal ke nilai numerik yang tepat.",
        "Contoh: ceban = 10000, goceng = 5000, gocap = 50000, 50 rebu = 50000.",
        "Kembalikan data transaksi yang akurat, ringkas, dan konsisten dengan konteks bisnis.",
      ].join(" "),
      prompt: body.text,
    });

    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("transactions").insert({
        user_id: DEMO_USER_ID,
        tipe_transaksi: dataTransaksi.tipeTransaksi,
        nominal: dataTransaksi.nominal,
        kategori: dataTransaksi.kategori,
        deskripsi: dataTransaksi.deskripsi,
        tingkat_urgensi: dataTransaksi.tingkatUrgensi,
        kelompok_keuangan: dataTransaksi.kelompokKeuangan,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    return NextResponse.json({ success: true, data: dataTransaksi });
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
