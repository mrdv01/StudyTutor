import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
const ai = new GoogleGenAI({});
// export const runtime = "edge";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    const { messages, noteId } = await req.json();
    const userMsg = messages[messages.length - 1].content;
    // 🧬 1️⃣ Create embedding for user's query
    const queryEmbedding = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [userMsg],
      taskType: "RETRIEVAL_QUERY",
      outputDimensionality: 3072, // must match your Supabase vector size
    });

    const queryVector = queryEmbedding.embeddings[0].values;

    // 🔎 2️⃣ Retrieve top 3 most relevant note chunks using SQL RPC
    const { data: matches, error } = await supabaseAdmin.rpc(
      "match_note_chunks",
      {
        query_embedding: queryVector,
        match_count: 3,
        user_id: user.id,
        note_id: noteId || null,
      }
    );

    if (error) {
      console.error("Supabase match error:", error);
    }

    // Combine top chunks into context text
    const contextText = matches?.map((m: any) => m.content).join("\n") || "";
    // Build conversation history
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: [
        {
          role: "user",
          parts: [
            {
              text: `You are an AI Tutor.
Your job is to help students understand concepts clearly, like a friendly personal tutor.

Here is what you should do:
- If the student has uploaded notes, use them as your main reference for answers.
- If no relevant notes are found, still answer the question to the best of your knowledge.
- In that case, always add at the end:
  "If you upload your notes, I can help better according to your syllabus."

Context from notes (if available):
${contextText || "No notes were provided."}
`,
            },
          ],
        },
        ...history,
      ],
    });

    // Use streaming API
    const stream = await chat.sendMessageStream({ message: userMsg });
    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          console.error("Gemini Stream Error:", err);
        } finally {
          controller.close();
        }
      },
    });

    // Return as a streaming response (not JSON)
    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Gemini Chat Error:", err);
    return new Response("Error: Unable to get a response right now.", {
      status: 500,
    });
  }
}
