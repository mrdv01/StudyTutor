import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId, noteId, title, qa } = await req.json();
    const supabase = await createClient();

    if (!userId || !qa) {
      return NextResponse.json(
        { error: "Missing userId or qa data" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("saved_qa").insert([
      {
        user_id: userId,
        note_id: noteId,
        title,
        qa,
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Save Q&A Error:", err);
    return NextResponse.json({ error: "Failed to save Q&A" }, { status: 500 });
  }
}
