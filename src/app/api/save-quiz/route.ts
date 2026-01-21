import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { userId, noteId, quiz, score } = await req.json();
    const supabase = await createClient();

    const { error } = await supabase
      .from("quizzes")
      .insert([
        { user_id: userId, note_id: noteId, title: quiz.title, quiz, score },
      ]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save Quiz Error:", err);
    return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
  }
}
