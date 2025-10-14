"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import confetti from "canvas-confetti";
import { ClipLoader } from "react-spinners";

export default function ReplayQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
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
        const res = await fetch(`/api/get-quiz/${quizId}`);
        const data = await res.json();
        if (data.quiz) setQuiz(data.quiz);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <ClipLoader color="#2563eb" size={60} /> {/* nice blue spinner */}
        <p className="text-gray-600 mt-4 text-sm">Loading quiz</p>
      </div>
    );
  }
  // console.log(quiz);
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
    }, 800);
  };

  return finished ? (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <Card className="max-w-xl w-full p-6 text-center shadow-lg bg-white">
        <h2 className="text-2xl font-bold mb-2">🎉 Quiz Completed!</h2>
        <p className="text-lg mb-6">
          You scored <strong>{score}</strong> out of <strong>{total}</strong>
        </p>
        <Button onClick={() => router.push("/dashboard/quizzes")}>
          Back to Saved Quizzes
        </Button>
      </Card>
    </div>
  ) : (
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
