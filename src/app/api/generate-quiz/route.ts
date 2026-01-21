import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";
import { extractGeminiText, cleanJsonResponse } from "@/lib/gemini-utils";
const ai = new GoogleGenAI({});

interface QuizQuestion {
  type: string;
  question: string;
  options?: string[];
  answer: string;
}

export async function POST(req: Request) {
  try {
    const { noteId } = await req.json();
    const supabase = await createClient();

    //  Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 📘 Fetch note content
    const { data: note, error } = await supabase
      .from("notes")
      .select("title, content")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (error || !note) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    //  Gemini prompt (MCQ + True/False only)
    const prompt = `
You are an expert AI tutor who creates interactive quizzes.

Generate 10  **ONLY multiple choice (MCQ)** and **True/False** questions from the given study notes.
Do NOT create descriptive or short-answer questions.

Follow these rules:
1. Use **MCQ** for definitions, comparisons, concepts, and factual knowledge.
2. Use **True/False** only for statements that can clearly be judged as true or false directly from the text.
3. Do NOT include open-ended "Why", "How", or "Explain" questions.
4. Keep questions simple, factual, and self-contained.
5. Each MCQ must have 4 options.
6. Each question must have one correct answer.
7. Output valid JSON — no markdown, no text outside JSON.

Format example:
{
  "title": "Quiz on [note title]",
  "questions": [
    {
      "type": "mcq",
      "question": "Which of the following best describes a distributed system?",
      "options": [
        "A single computer performing all tasks",
        "Multiple computers working together and appearing as one system",
        "A system using only one CPU",
        "A standalone computer with shared memory"
      ],
      "answer": "Multiple computers working together and appearing as one system"
    },
    {
      "type": "truefalse",
      "question": "Distributed systems always share a single memory space.",
      "answer": "False"
    }
  ]
}

Generate a quiz based on these notes:
"${note.content}"
`;

    //  Generate content from Gemini
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    //  Extract clean JSON text
    let text = extractGeminiText(result);
    text = cleanJsonResponse(text);

    //  Parse quiz JSON safely
    let quizData;
    try {
      quizData = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse Gemini output:", text, err);
      return NextResponse.json(
        { error: "Invalid quiz format from Gemini." },
        { status: 500 }
      );
    }

    //  Sanitize quiz: allow only MCQ & True/False
    quizData.questions = quizData.questions.filter(
      (q: QuizQuestion) => q.type === "mcq" || q.type === "truefalse"
    );

    //  Ensure MCQs have valid options
    quizData.questions = quizData.questions.map((q: QuizQuestion) => {
      if (q.type === "mcq" && (!q.options || q.options.length < 2)) {
        q.options = ["Option A", "Option B", "Option C", "Option D"];
      }
      return q;
    });

    // console.log(" Quiz generated:", quizData);

    return NextResponse.json({ quiz: quizData });
  } catch (err) {
    console.error("Quiz Generation Error:", err);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
