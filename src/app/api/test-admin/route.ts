import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";

const ai = new GoogleGenAI({});

export async function GET() {
  try {
    const testQuery = "What is an react memoization?";
    const testUserId = "43ed6028-a5a3-420c-b3b3-49c98c1c1d68";
    // Generate embedding
    const embedRes = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [testQuery],
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: 3072,
    });

    const queryVector = embedRes.embeddings[0].values;

    // 🔎 Call match_note_chunks
    const { data, error } = await supabaseAdmin.rpc("match_note_chunks", {
      query_embedding: queryVector,
      match_count: 3,
      user_id: testUserId,
    });

    if (error) {
      console.error("🔴 Supabase RPC Error:", error);
      return NextResponse.json(
        { error: "Supabase RPC Error", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "✅ match_note_chunks function is working!",
      matches: data,
    });
  } catch (err: any) {
    console.error("❌ Test Match Error:", err);
    return NextResponse.json(
      {
        error: "match_note_chunks test failed",
        details: err.message || String(err),
      },
      { status: 500 }
    );
  }
}
