/* eslint-disable @typescript-eslint/no-require-imports */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// pdf-parse v1.1.1 is CJS
const pdfParse = require("pdf-parse");

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await pdfParse(buffer);

    return NextResponse.json({
      text: result.text.trim(),
      pages: result.numpages,
    });
  } catch (err) {
    console.error("PDF parse failed:", err);
    return NextResponse.json(
      { error: "Failed to extract text" },
      { status: 500 },
    );
  }
}
