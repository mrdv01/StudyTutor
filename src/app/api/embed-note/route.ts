import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { noteId, text } = await req.json();
    const supabase = await createClient();

    // Split text into small chunks (1000–1500 characters each)
    const chunks = text.match(/.{1,1000}(\s|$)/g) || [];

    console.log(`Generating embeddings for ${chunks.length} chunks...`);

    //  Generate embeddings using the new Gemini Embedding API
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (ai.models as any).embedContent({
      model: "gemini-embedding-001",
      contents: chunks,
      taskType: "RETRIEVAL_DOCUMENT", // optimized for storing document embeddings
      outputDimensionality: 768, // balanced choice (saves space)
    });

    const embeddings = response.embeddings.map((e: { values: number[] }) => e.values);
    const { data: noteData } = await supabase
      .from("notes")
      .select("user_id")
      .eq("id", noteId)
      .single();

    const userId = noteData?.user_id;
    //  Save each chunk + embedding into Supabase
    const { error } = await supabase.from("note_chunks").insert(
      chunks.map((chunk: string, i: number) => ({
        note_id: noteId,
        user_id: userId,
        content: chunk,
        embedding: embeddings[i],
      }))
    );

    if (error) throw error;

    return NextResponse.json({
      message: `${chunks.length} chunks embedded successfully.`,
    });
  } catch (err) {
    console.error("Embedding error:", err);
    return NextResponse.json(
      { error: "Failed to generate embeddings" },
      { status: 500 }
    );
  }
}
