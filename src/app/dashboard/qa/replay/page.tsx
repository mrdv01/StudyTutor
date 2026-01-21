"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, RotateCcw, Eye } from "lucide-react";
import confetti from "canvas-confetti";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

const supabase = createClient();

interface QAItem {
  question: string;
  answer: string;
}

interface QAData {
  title: string;
  qa: QAItem[];
}

export default function ReplayQAPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // saved_qa.id
  const router = useRouter();

  const [qaData, setQaData] = useState<QAData | null>(null);
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);

  //  Fetch saved Q&A from Supabase
  useEffect(() => {
    const fetchQA = async () => {
      if (!id) return;

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          Swal.fire({
            icon: "warning",
            title: "Login Required",
            text: "Please login to view saved Q&A.",
          });
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("saved_qa")
          .select("title, qa")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (error || !data) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Could not load saved Q&A.",
          });
          router.push("/dashboard/qa/saved");
          return;
        }

        setQaData(data);
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong while loading the Q&A.",
        });
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQA();
  }, [id, router]);

  const handleNext = () => {
    if (!qaData) return;
    if (current + 1 < qaData.qa.length) {
      setCurrent(current + 1);
      setShowAnswer(false);
    } else {
      setFinished(true);
      setTimeout(() => confetti({ particleCount: 100, spread: 70 }), 300);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
      setShowAnswer(false);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setShowAnswer(false);
    setFinished(false);
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-gray-500 space-y-4">
        <ClipLoader color="#2563eb" size={40} />
        <p className="text-sm text-gray-600">Loading your saved Q&A...</p>
      </div>
    );

  if (!qaData)
    return (
      <div className="text-center text-gray-600 mt-10">Could not load Q&A.</div>
    );

  const total = qaData.qa.length;
  const progress = ((current + 1) / total) * 100;
  const item = qaData.qa[current];

  //  Finished view
  if (finished)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <Card className="max-w-lg w-full p-6 text-center shadow-lg bg-white">
          <h2 className="text-2xl font-bold mb-3">🎉 Session Complete!</h2>
          <p className="text-gray-600 mb-4">
            You’ve reviewed all {total} questions from{" "}
            <strong>{qaData.title}</strong>.
          </p>

          <div className="flex justify-center gap-4">
            <Button onClick={handleRestart} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" /> Restart
            </Button>
            <Button onClick={() => router.push("/dashboard/qa/saved")}>
              Back to Saved
            </Button>
          </div>
        </Card>
      </div>
    );

  //  Practice view
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-lg w-full p-6 shadow-md bg-white">
        {/* Progress */}
        <Progress value={progress} className="mb-4" />
        <p className="text-sm text-gray-500 text-center mb-3">
          Question {current + 1} of {total}
        </p>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-2 text-center text-gray-700">
          {qaData.title}
        </h2>

        {/* Question */}
        <h3 className="text-lg font-medium mb-4 text-gray-800 text-center">
          {item.question}
        </h3>

        {/* Answer */}
        {showAnswer ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <p className="text-gray-800 text-center">{item.answer}</p>
          </div>
        ) : (
          <div className="text-center mb-4">
            <Button onClick={() => setShowAnswer(true)} className="mt-2">
              <Eye className="w-4 h-4" />
              Show Answer
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={current === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Prev
          </Button>

          <Button onClick={handleNext}>
            {current + 1 === total ? "Finish" : "Next"}{" "}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
