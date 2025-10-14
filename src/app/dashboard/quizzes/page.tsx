"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Play } from "lucide-react";

const supabase = createClient();

export default function SavedQuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  //  Fetch saved quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch("/api/get-quizzes");
        const data = await res.json();
        if (data.quizzes) setQuizzes(data.quizzes);
        else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error || "Failed to load saved quizzes.",
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Unable to fetch quizzes. Try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  //  Handle quiz deletion
  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Delete Quiz?",
      text: "This will permanently remove the quiz from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
    });

    if (!confirm.isConfirmed) return;

    const { error } = await supabase.from("quizzes").delete().eq("id", id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete quiz. Please try again.",
      });
      return;
    }

    // Remove from UI instantly
    setQuizzes((prev) => prev.filter((q) => q.id !== id));

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Your quiz has been deleted successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <ClipLoader color="#2563eb" size={60} />
        <p className="text-gray-600 mt-4 text-sm">Loading saved quizzes...</p>
      </div>
    );
  }

  if (!quizzes.length) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        No saved quizzes yet.
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {quizzes.map((quiz) => (
        <Card
          key={quiz.id}
          className="p-4 bg-white shadow-sm border hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold mb-2">{quiz.title}</h2>
          <p className="text-sm text-gray-500">
            Saved on {new Date(quiz.created_at).toLocaleDateString()}
          </p>
          {quiz.score !== null && (
            <p className="text-sm text-gray-700 mt-1">
              Last Score: <strong>{quiz.score}</strong>
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <Button
              className="flex-1"
              onClick={() => router.push(`/dashboard/quizzes/${quiz.id}`)}
            >
              <Play className="w-4 h-4 mr-1" /> Replay
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleDelete(quiz.id)}
              className="flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
