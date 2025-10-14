import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("saved_qa")
      .select("id, title, created_at, note_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ qas: data });
  } catch (err) {
    console.error("Get Saved Q&A Error:", err);
    return NextResponse.json({ error: "Failed to load Q&A" }, { status: 500 });
  }
}
