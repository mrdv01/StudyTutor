"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Save,
  PartyPopper,
} from "lucide-react";
import confetti from "canvas-confetti";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";

const supabase = createClient();

export default function QAPlayPage() {
  const searchParams = useSearchParams();
  const noteId = searchParams.get("noteId");
  const router = useRouter();

  const [qaData, setQaData] = useState<any>(null);
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Q&A
  useEffect(() => {
    const fetchQA = async () => {
      try {
        const res = await fetch("/api/generate-qa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ noteId }),
        });

        const data = await res.json();
        if (data.qa) setQaData(data.qa);
        else
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Could not generate Q&A. Try again later.",
          });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch Q&A.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQA();
  }, [noteId]);

  const handleSaveQA = async () => {
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Please log in",
        text: "You must be logged in to save this Q&A session.",
      });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/save-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          noteId,
          title: qaData.title,
          qa: qaData.qa,
        }),
      });

      if (res.ok) {
        confetti({ particleCount: 120, spread: 70 });
        Swal.fire({
          icon: "success",
          title: "Q&A Saved!",
          text: "Your Q&A session has been saved successfully.",
          confirmButtonColor: "#2563eb",
        }).then(() => router.push("/dashboard/qa/saved"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Could not save Q&A. Please try again.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Something went wrong while saving.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-gray-500 space-y-4">
        <ClipLoader color="#2563eb" size={40} />
        <p className="text-sm text-gray-600">Generating your Q&A set...</p>
      </div>
    );

  if (!qaData)
    return (
      <div className="text-center text-gray-600 mt-10">Could not load Q&A.</div>
    );

  const total = qaData.qa.length;
  const progress = ((current + 1) / total) * 100;
  const item = qaData.qa[current];

  const handleNext = () => {
    if (current + 1 < total) {
      setCurrent(current + 1);
      setShowAnswer(false);
    } else {
      setFinished(true);
      setTimeout(() => confetti({ particleCount: 80, spread: 70 }), 300);
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
    setFinished(false);
    setShowAnswer(false);
  };

  //  Finished view
  if (finished)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <Card className="max-w-lg w-full p-6 text-center shadow-lg bg-white">
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-3">
            <PartyPopper className="w-6 h-6" />
            Great job!
          </h2>

          <p className="text-gray-600 mb-4">
            You’ve completed all {total} short-answer questions.
          </p>

          <div className="flex justify-center gap-4">
            <Button onClick={handleRestart} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" /> Restart
            </Button>
            <Button onClick={handleSaveQA} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Q&A"}
            </Button>
          </div>
        </Card>
      </div>
    );

  // Practice Mode
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-lg w-full p-6 shadow-md bg-white">
        {/* Progress */}
        <Progress value={progress} className="mb-4" />
        <p className="text-sm text-gray-500 text-center mb-3">
          Question {current + 1} of {total}
        </p>

        {/* Question */}
        <h2 className="text-lg font-semibold mb-4 text-gray-800 text-center">
          {item.question}
        </h2>

        {/* Answer */}
        {showAnswer ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
            <p className="text-gray-800 text-center">{item.answer}</p>
          </div>
        ) : (
          <div className="text-center mb-4">
            <Button onClick={() => setShowAnswer(true)} className="mt-2">
              👀 Show Answer
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
