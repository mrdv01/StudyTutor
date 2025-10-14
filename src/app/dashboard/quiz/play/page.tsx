"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { PartyPopper, Save } from "lucide-react";
const supabase = createClient();

export default function QuizPlayPage() {
  const router = useRouter();
  const params = useSearchParams();
  const noteId = params.get("noteId");
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [status, setStatus] = useState<"neutral" | "correct" | "wrong">(
    "neutral"
  );

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noteId }),
        });
        const data = await res.json();
        if (data.quiz) setQuiz(data.quiz);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [noteId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <ClipLoader color="#2563eb" size={60} /> {/* nice blue spinner */}
        <p className="text-gray-600 mt-4 text-sm">Loading quiz</p>
      </div>
    );
  }

  const total = quiz.questions.length;
  const question = quiz.questions[current];
  const progress = ((current + 1) / total) * 100;

  const handleAnswer = (option: string) => {
    setSelected(option);
    const correct = option === question.answer;

    if (correct) {
      setScore((s) => s + 1);
      setStatus("correct");
    } else {
      setStatus("wrong");
    }

    setTimeout(() => {
      setStatus("neutral");
      setSelected(null);
      if (current + 1 < total) {
        setCurrent((c) => c + 1);
      } else {
        setFinished(true);
        setTimeout(() => confetti({ particleCount: 120, spread: 70 }), 300);
      }
    }, 1000);
  };

  const handleSaveQuiz = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Please login to save your quiz.");

    await fetch("/api/save-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        noteId,
        quiz,
        score,
      }),
    });

    Swal.fire("Saved!", "Your quiz has been saved.", "success");
    router.push("/dashboard/quizzes");
  };

  //  Quiz finished view
  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <Card className="max-w-xl w-full p-6 text-center shadow-lg bg-white">
          <h2 className="text-2xl font-bold mb-3">
            {" "}
            <PartyPopper className="w-4 h-4" /> Quiz Completed!
          </h2>
          <p className="text-lg mb-6">
            You scored <strong>{score}</strong> out of <strong>{total}</strong>
          </p>

          <div className="text-left mb-4">
            <h3 className="font-semibold mb-2"> Correct Answers:</h3>
            {quiz.questions.map((q: any, i: number) => (
              <div key={i} className="mb-2 border-b pb-2">
                <p className="font-medium text-gray-800">
                  {i + 1}. {q.question}
                </p>
                <p className="text-sm text-green-600">
                  Correct answer: <strong>{q.answer}</strong>
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-6">
            <Button onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button onClick={handleSaveQuiz} variant="outline">
              <Save className="w-4 h-4" /> Save Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  //  Quiz in progress view
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-xl w-full p-6 shadow-md bg-white relative">
        {/* Progress */}
        <Progress value={progress} status={status} className="mb-6" />

        {/* Question */}
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          {current + 1}. {question.question}
        </h2>

        {/* Options */}
        {question.options ? (
          <div className="flex flex-col gap-3">
            {question.options.map((opt: string, i: number) => {
              const isCorrect = opt === question.answer;
              const isSelected = opt === selected;
              const base =
                "border rounded-lg px-4 py-3 text-left cursor-pointer transition";
              const color =
                selected === null
                  ? "hover:bg-gray-100 border-gray-300"
                  : isSelected
                  ? isCorrect
                    ? "bg-green-100 border-green-500"
                    : "bg-red-100 border-red-500"
                  : "opacity-70";

              return (
                <button
                  key={i}
                  onClick={() => selected === null && handleAnswer(opt)}
                  className={`${base} ${color}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          // True/False
          <div className="flex flex-col gap-3">
            {["True", "False"].map((opt) => (
              <button
                key={opt}
                onClick={() => selected === null && handleAnswer(opt)}
                className={`border rounded-lg px-4 py-3 ${
                  selected === opt
                    ? opt === question.answer
                      ? "bg-green-100 border-green-500"
                      : "bg-red-100 border-red-500"
                    : "hover:bg-gray-100 border-gray-300"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
