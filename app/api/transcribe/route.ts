import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { audio?: string; mimeType?: string };

    if (!body.audio) {
      return NextResponse.json(
        { error: "Audio data is required", details: "Body harus berisi field audio dalam format base64." },
        { status: 400 },
      );
    }

    const audioBuffer = Buffer.from(body.audio, "base64");
    
    // Clean the mimeType from any parameters like ';codecs=opus' which can fail in Gemini validation
    const rawMimeType = body.mimeType || "audio/webm";
    const mimeType = rawMimeType.split(";")[0].trim();

    const { text } = await generateText({
      model: google(GEMINI_MODEL),
      system: [
        "Anda adalah asisten transkripsi audio bahasa Indonesia yang profesional.",
        "Tuliskan apa yang diucapkan dalam audio secara tepat, verbatim, dan akurat.",
        "Jangan menambahkan komentar, saran, atau teks tambahan apa pun. Cukup kembalikan transkripnya saja.",
        "Pertahankan slang angka lokal (seperti ceban, gocap, goceng, 50 rebu, dst) jika diucapkan, jangan diubah menjadi angka standard.",
      ].join(" "),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: audioBuffer,
              mediaType: mimeType,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ success: true, text: text.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to transcribe audio",
        details: message,
      },
      { status: 500 },
    );
  }
}
