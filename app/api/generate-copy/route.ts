import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase";

// export const runtime = "edge";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const CopyRequestSchema = z.object({
  platform: z.enum(["whatsapp", "instagram", "tiktok"]),
  style: z.enum(["formal", "santai", "persuasif"]),
  image: z.instanceof(File),
});

const CopyResultSchema = z.object({
  productName: z.string().min(1),
  productType: z.string().min(1),
  caption: z.string().min(1),
  hashtags: z.array(z.string().min(1)).min(3).max(12),
  angle: z.string().min(1),
});

const BUCKET_NAME = "marketing-assets";

const PLATFORM_GUIDE = {
  whatsapp:
    "WhatsApp Status: singkat, jelas, terasa personal, dan kuat di ajakan chat langsung.",
  instagram:
    "Instagram: lebih visual, punya hook pembuka yang kuat, dan cocok dengan caption yang engaging.",
  tiktok:
    "TikTok: cepat, punchy, energik, dan mendorong rasa penasaran tanpa terlalu panjang.",
} as const;

const STYLE_GUIDE = {
  formal: "Bahasa rapi, profesional, meyakinkan, dan cocok untuk citra brand yang serius.",
  santai:
    "Bahasa hangat, akrab, natural, dan terasa seperti berbicara dengan pelanggan sehari-hari.",
  persuasif:
    "Bahasa yang dorong aksi, menonjolkan manfaat, urgensi, dan alasan untuk segera membeli.",
} as const;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const platform = formData.get("platform");
    const style = formData.get("style");
    const image = formData.get("image");

    const parsed = CopyRequestSchema.safeParse({ platform, style, image });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid marketing request",
          details: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (!parsed.data.image.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Invalid file type",
          details: "File yang diunggah harus berupa gambar.",
        },
        { status: 400 },
      );
    }

    if (parsed.data.image.size > 12 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "Image too large",
          details: "Ukuran gambar maksimal 12MB.",
        },
        { status: 400 },
      );
    }

    const supabase = createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        {
          error: "Supabase not configured",
          details:
            "NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY harus tersedia.",
        },
        { status: 500 },
      );
    }

    const safeName = parsed.data.image.name.replace(/[^a-zA-Z0-9_.-]+/g, "_");
    const storagePath = `marketing/${crypto.randomUUID()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, parsed.data.image, {
        contentType: parsed.data.image.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: "Failed to upload image",
          details: uploadError.message,
        },
        { status: 500 },
      );
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath);

    const platformGuide = PLATFORM_GUIDE[parsed.data.platform];
    const styleGuide = STYLE_GUIDE[parsed.data.style];

    const { object: generatedCopy } = await generateObject({
      model: google(GEMINI_MODEL),
      schema: CopyResultSchema,
      system: [
        "Anda adalah copywriter senior untuk UMKM Indonesia.",
        "Analisis gambar produk yang diunggah, identifikasi jenis produk, nilai visualnya, dan manfaat utamanya.",
        "Buat output yang relevan dengan platform tujuan dan gaya bahasa yang dipilih.",
        "Gunakan Bahasa Indonesia yang natural dan hasilkan caption yang siap dipakai.",
        "Kembalikan hashtag yang relevan, spesifik, dan tidak terlalu generik.",
      ].join(" "),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                `Platform: ${parsed.data.platform}`,
                `Arahan platform: ${platformGuide}`,
                `Gaya bahasa: ${parsed.data.style}`,
                `Arahan gaya: ${styleGuide}`,
                "Tugas: buat 1 caption promosi utama dan daftar hashtag yang relevan.",
                "Jika ada nama produk yang terlihat, sebutkan secara natural.",
              ].join("\n"),
            },
            {
              type: "image",
              image: publicData.publicUrl,
            },
          ],
        },
      ],
    });

    const hashtags = generatedCopy.hashtags
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag.replace(/^#+/, "")}`));

    return NextResponse.json({
      success: true,
      data: {
        productName: generatedCopy.productName,
        productType: generatedCopy.productType,
        caption: generatedCopy.caption,
        angle: generatedCopy.angle,
        hashtags,
        platform: parsed.data.platform,
        style: parsed.data.style,
        imageUrl: publicData.publicUrl,
        storagePath,
        bucket: BUCKET_NAME,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to generate marketing copy",
        details: message,
      },
      { status: 500 },
    );
  }
}