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

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
Summarize this note clearly and concisely in academic language.
Keep it under 5 key points and one short paragraph.

Title: ${note.title}
Content: """${note.content}"""
`;

    //  Retry logic for overloaded model (max 3 retries)
    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        break; // success — exit loop
      } catch (err: any) {
        if (err?.error?.code === 503 && retries > 1) {
          console.warn("Model overloaded, retrying...");
          await new Promise((res) => setTimeout(res, 2000)); // wait 2s
          retries--;
          continue;
        } else {
          throw err;
        }
      }
    }

    //  Extract summary text safely
    let text = extractGeminiText(result);
    text = cleanJsonResponse(text);

    // Save to DB
    const { error: updateError } = await supabase
      .from("notes")
      .update({ summary: text })
      .eq("id", noteId)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ summary: text });
  } catch (err: any) {
    console.error("Summarize Note Error:", err);

    if (err?.error?.code === 503) {
      return NextResponse.json(
        {
          error:
            "The AI model is temporarily busy. Please try again in a few seconds.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to summarize note." },
      { status: 500 }
    );
  }
}
