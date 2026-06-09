import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { PDFDocument, rgb } from "pdf-lib";

type InvoiceData = {
  customerName: string;
  customerAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  paymentTerms: string;
};

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

    const body = (await request.json()) as InvoiceData;

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();

    // Add content to PDF
    const fontSize = 12;
    const margin = 50;
    let yPosition = height - margin;

    // Title
    page.drawText("INVOICE", {
      x: margin,
      y: yPosition,
      size: 20,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Business info
    page.drawText("LarisManis AI", {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    page.drawText("Jl. Merdeka No. 123", {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    page.drawText("Jakarta, Indonesia", {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    page.drawText("Email: info@larismanis.ai", {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Customer info
    page.drawText("Kepada:", {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    page.drawText(body.customerName, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    page.drawText(body.customerAddress, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Invoice details
    page.drawText(`Nomor Invoice: ${body.invoiceNumber}`, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    page.drawText(`Tanggal Invoice: ${body.invoiceDate}`, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    page.drawText(`Jatuh Tempo: ${body.dueDate}`, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
    page.drawText(`Syarat Pembayaran: ${body.paymentTerms}`, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Table header
    page.drawText("Deskripsi", {
      x: margin,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText("Kuantitas", {
      x: 250,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText("Harga Satuan", {
      x: 350,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText("Jumlah", {
      x: 450,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Draw line under header
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Table rows
    for (const item of body.items) {
      page.drawText(item.description, {
        x: margin,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.quantity.toString(), {
        x: 250,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.unitPrice.toLocaleString("id-ID", { style: "currency", currency: "IDR" }), {
        x: 350,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.amount.toLocaleString("id-ID", { style: "currency", currency: "IDR" }), {
        x: 450,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;
    }

    // Draw line under items
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    // Totals
    page.drawText("Subtotal:", {
      x: 350,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(body.subtotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" }), {
      x: 450,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText("Pajak (10%):", {
      x: 350,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(body.tax.toLocaleString("id-ID", { style: "currency", currency: "IDR" }), {
      x: 450,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;

    page.drawText("Total:", {
      x: 350,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(body.total.toLocaleString("id-ID", { style: "currency", currency: "IDR" }), {
      x: 450,
      y: yPosition,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes = await pdfDoc.save();

    // Create a response with the PDF
return new NextResponse(pdfBytes as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${body.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to generate invoice",
        details: message,
      },
      { status: 500 }
    );
  }
}