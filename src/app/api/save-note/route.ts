import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function POST(req: Request) {
  try {
    const { userId, title, content } = await req.json();

    if (!userId || !content) {
      return NextResponse.json(
        { error: "Missing userId or content" },
        { status: 400 }
      );
    }

    // Step 1: Save note in Supabase
    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: userId,
          title: title || "Untitled Note",
          content,
        },
      ])
      .select("id")
      .single();

    if (error) throw error;
    const noteId = data.id;

    //  Step 2: Trigger embedding generation (background)
    // Uses NEXT_PUBLIC_BASE_URL to call your own API
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";

    await fetch(`${baseUrl}/api/embed-note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, text: content }),
    });

    return NextResponse.json({
      success: true,
      message: "Note saved & embedding process started",
    });
  } catch (err) {
    console.error("Save Note Error:", err);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
