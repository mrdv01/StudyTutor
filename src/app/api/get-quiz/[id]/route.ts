import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const { data, error } = await supabase
      .from("quizzes")
      .select("quiz, title")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ quiz: data.quiz, title: data.title });
  } catch (err) {
    console.error("Get Quiz Error:", err);
    return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
  }
}
