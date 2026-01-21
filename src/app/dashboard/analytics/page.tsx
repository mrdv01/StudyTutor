"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ClipLoader } from "react-spinners";
import {
  Trophy,
  Brain,
  BookOpen,
  ClipboardList,
  ChartNoAxesCombined,
  Activity,
  ChartPie,
} from "lucide-react";

const COLORS = ["#2563eb", "#22c55e", "#facc15", "#ef4444"];

interface Stats {
  totalNotes: number;
  totalQuizzes: number;
  totalQA: number;
  averageScore: number;
  quizHistory: { name: string; score: number }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all user data
      const [notes, quizzes, qa] = await Promise.all([
        supabase.from("notes").select("*").eq("user_id", user.id),
        supabase.from("quizzes").select("*").eq("user_id", user.id),
        supabase.from("saved_qa").select("*").eq("user_id", user.id),
      ]);

      const totalNotes = notes.data?.length || 0;
      const totalQuizzes = quizzes.data?.length || 0;
      const totalQA = qa.data?.length || 0;

      const averageScore = quizzes.data?.length
        ? quizzes.data.reduce(
            (acc: number, q: { score: number }) => acc + (q.score || 0),
            0
          ) / quizzes.data.length
        : 0;

      const quizHistory = quizzes.data?.map((q: { score: number }, i: number) => ({
        name: `Quiz ${i + 1}`,
        score: q.score,
      }));

      setStats({
        totalNotes,
        totalQuizzes,
        totalQA,
        averageScore,
        quizHistory: quizHistory || [],
      });

      setLoading(false);
    };

    fetchStats();
  }, [supabase]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <ClipLoader color="#2563eb" size={60} />
        <p className="text-gray-600 mt-4 text-sm">Fetching your progress...</p>
      </div>
    );

  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
        <ChartPie className="w-5 h-5" />
        Your Learning Analytics
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen />}
          title="Notes"
          value={stats.totalNotes}
          color="bg-blue-100"
        />
        <StatCard
          icon={<ClipboardList />}
          title="Quizzes"
          value={stats.totalQuizzes}
          color="bg-yellow-100"
        />
        <StatCard
          icon={<Brain />}
          title="Q&A Sessions"
          value={stats.totalQA}
          color="bg-green-100"
        />
        <StatCard
          icon={<Trophy />}
          title="Avg Quiz Score"
          value={`${stats.averageScore.toFixed(1)}%`}
          color="bg-purple-100"
        />
      </div>

      {/* Performance Chart */}
      <Card className="shadow-md border">
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <ChartNoAxesCombined className="w-5 h-5" />
            Quiz Performance Over Time
          </h2>

          {stats.quizHistory?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.quizHistory}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#2563eb" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-10">
              No quizzes yet — take one to get started!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Activity Distribution */}
      <Card className="shadow-md border">
        <CardContent className="p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
            <Activity className="w-5 h-5" />
            Activity Breakdown
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Notes", value: stats.totalNotes },
                  { name: "Quizzes", value: stats.totalQuizzes },
                  { name: "Q&A", value: stats.totalQA },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="shadow-md border">
      <CardContent
        className={`p-4 flex flex-col items-center justify-center ${color}`}
      >
        <div className="text-3xl mb-2">{icon}</div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
