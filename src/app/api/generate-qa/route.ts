import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { extractGeminiText, cleanJsonResponse } from "@/lib/gemini-utils";
const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { noteId } = await req.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch note
    const { data: note, error } = await supabase
      .from("notes")
      .select("title, content")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (error || !note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const prompt = `
You are an AI tutor. Generate 8 short descriptive question-answer pairs based strictly on this study note.

Rules:
- Focus on conceptual and theoretical questions.
- Each question should have a concise 1-2 sentence answer.
- Do NOT generate multiple choice or True/False questions.
- Output JSON only.

Example format:
{
  "title": "Short Q&A on [Note Title]",
  "qa": [
    { "question": "What is CPU scheduling?", "answer": "It decides which process runs next in the CPU." },
    { "question": "Explain context switching.", "answer": "It is the process of storing and restoring the state of a CPU so multiple processes can share one CPU." }
  ]
}

Here is the note:
"${note.content}"
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    let text = extractGeminiText(result);
    text = cleanJsonResponse(text);

    const qaData = JSON.parse(text);

    return NextResponse.json({ qa: qaData });
  } catch (err) {
    console.error("QA Generation Error:", err);
    return NextResponse.json(
      { error: "Failed to generate Q&A" },
      { status: 500 }
    );
  }
}
