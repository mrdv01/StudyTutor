"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Brain, FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";
const supabase = createClient();

export default function DashboardPage() {
  const [stats, setStats] = useState({
    notes: 0,
    quizzes: 0,
    qas: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [notesRes, quizRes, qaRes] = await Promise.all([
        supabase
          .from("notes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("quizzes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("saved_qa")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      setStats({
        notes: notesRes.count || 0,
        quizzes: quizRes.count || 0,
        qas: qaRes.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <ClipLoader color="#2563eb" size={60} />
        <p className="text-gray-600 mt-4 text-sm">Loading Dashboard</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-gray-600 mt-2">
          Manage your notes, quizzes, and AI Q&A — all in one place.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 flex flex-col items-center text-center bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
          <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="text-xl font-semibold">{stats.notes}</h3>
          <p className="text-gray-600 text-sm">Saved Notes</p>
        </Card>

        <Card className="p-5 flex flex-col items-center text-center bg-gradient-to-br from-green-50 to-white border-green-100 shadow-sm">
          <Brain className="w-8 h-8 text-green-600 mb-2" />
          <h3 className="text-xl font-semibold">{stats.quizzes}</h3>
          <p className="text-gray-600 text-sm">Saved Quizzes</p>
        </Card>

        <Card className="p-5 flex flex-col items-center text-center bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-sm">
          <FileText className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="text-xl font-semibold">{stats.qas}</h3>
          <p className="text-gray-600 text-sm">Saved Q&A Sets</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Quick Actions ⚡</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push("/dashboard/upload")}>
            Upload New Notes
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/chat")}
          >
            Chat with AI Tutor
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/notes")}
          >
            View Notes
          </Button>
          <Button onClick={() => router.push("/dashboard/quizzes")}>
            Practice Saved Quizzes
          </Button>
        </div>
      </div>

      {/* AI Motivation */}
      <Card className="p-6 flex items-center gap-4 bg-gradient-to-r from-indigo-50 to-white border-indigo-100 shadow-sm">
        <Sparkles className="w-8 h-8 text-indigo-500" />
        <div>
          <p className="text-gray-800 font-medium">
            “Every time you learn, your brain grows stronger. Keep going — your
            future self will thank you!”
          </p>
          <p className="text-sm text-gray-500 mt-1">— Your AI Study Buddy 🤖</p>
        </div>
      </Card>
    </div>
  );
}
