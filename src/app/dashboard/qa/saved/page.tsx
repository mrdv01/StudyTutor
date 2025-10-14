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

export default function SavedQAPage() {
  const router = useRouter();
  const [qas, setQAs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch saved Q&A
  useEffect(() => {
    const fetchQAs = async () => {
      try {
        const res = await fetch("/api/get-saved-qa");
        const data = await res.json();
        if (data.qas) setQAs(data.qas);
        else
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.error || "Failed to load saved Q&A.",
          });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong while fetching saved Q&A.",
        });
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQAs();
  }, []);

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Delete Q&A?",
      text: "This will permanently remove it from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#e11d48",
    });

    if (!confirm.isConfirmed) return;

    const { error } = await supabase.from("saved_qa").delete().eq("id", id);

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete Q&A.",
      });
      console.log(error);
      return;
    }

    setQAs((prev) => prev.filter((qa) => qa.id !== id));

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "Q&A removed successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-gray-500 space-y-4">
        <ClipLoader color="#2563eb" size={40} />
        <p className="text-sm text-gray-600">Loading saved Q&A...</p>
      </div>
    );

  if (!qas.length)
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-500">
        No saved Q&A yet.
      </div>
    );

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {qas.map((qa) => (
        <Card
          key={qa.id}
          className="p-4 bg-white shadow-sm border hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold mb-1">{qa.title}</h2>
          <p className="text-sm text-gray-500 mb-3">
            Saved on {new Date(qa.created_at).toLocaleDateString()}
          </p>

          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/dashboard/qa/replay?id=${qa.id}`)}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-1" /> Replay
            </Button>

            <Button
              variant="destructive"
              onClick={() => handleDelete(qa.id)}
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
