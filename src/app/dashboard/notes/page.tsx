"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Loader2,
  Sparkles,
  Eye,
  MessageCircle,
  Notebook,
} from "lucide-react";
import Swal from "sweetalert2";
import { ClipLoader } from "react-spinners";
import { useRouter } from "next/navigation";
import SummaryModal from "@/components/ui/SummaryModal";

import { marked } from "marked";

type Note = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  summary?: string;
};

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const supabase = createClient();

  //  Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        Swal.fire("Error", "Failed to fetch notes.", "error");
      } else setNotes(data || []);

      setLoading(false);
    };

    fetchNotes();
  }, []);

  //  Summarize handler
  const handleSummarize = async (noteId: string) => {
    setSummarizing(noteId);

    const res = await fetch("/api/summarize-note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId }),
    });

    const data = await res.json();
    setSummarizing(null);

    if (data.summary) {
      Swal.fire({
        icon: "success",
        title: "Summary Generated",
        html: `<div style="text-align:left;">${marked.parse(
          data.summary
        )}</div>`,
        width: 600,
      });

      // Update state so summary button appears
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId ? { ...n, summary: data.summary } : n))
      );
    } else if (res.status === 503) {
      Swal.fire({
        icon: "warning",
        title: "AI Model Busy ",
        text: "Gemini is currently overloaded. Please try again later.",
      });
    } else {
      Swal.fire("Error", data.error || "Failed to generate summary.", "error");
    }
  };

  //  Delete handler
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete this note?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      Swal.fire("Error", "Failed to delete note.", "error");
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      Swal.fire("Deleted!", "Your note has been deleted.", "success");
    }
  };

  //  UI States
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <ClipLoader color="#2563eb" size={60} />
        <p className="text-gray-600 mt-4 text-sm">Loading saved notes...</p>
      </div>
    );

  if (notes.length === 0)
    return (
      <p className="text-center mt-10 text-gray-600">
        You haven’t uploaded any notes yet.
      </p>
    );

  //  Render Notes
  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 text-2xl font-semibold mb-4">
        <Notebook className="w-6 h-6" />
        My Saved Notes
      </h1>

      {notes.map((note) => (
        <Card key={note.id} className="border-gray-200 shadow-sm">
          <CardContent className="p-4 flex flex-col gap-3">
            {/* Title + Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {note.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {new Date(note.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/dashboard/quiz/play?noteId=${note.id}`)
                  }
                >
                  Take Quiz
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/dashboard/qa/play?noteId=${note.id}`)
                  }
                >
                  Q&A
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSummarize(note.id)}
                  disabled={summarizing === note.id}
                  className="flex items-center gap-2"
                >
                  {summarizing === note.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Summarize
                    </>
                  )}
                </Button>

                {note.summary && (
                  <Button
                    variant="outline"
                    onClick={() => setSelectedNote(note)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Summary
                  </Button>
                )}

                <Button
                  variant="secondary"
                  onClick={() =>
                    router.push(`/dashboard/chat?noteId=${note.id}`)
                  }
                >
                  <MessageCircle className="w-4 h-4" /> Chat
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setExpanded((prev) => (prev === note.id ? null : note.id))
                  }
                >
                  {expanded === note.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(note.id)}
                  className="text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Collapsible Content */}
            {expanded === note.id && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-[300px] overflow-y-auto border">
                {note.content}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/*  Summary Modal */}
      {selectedNote && (
        <SummaryModal
          open={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          title={selectedNote.title}
          summary={selectedNote.summary || ""}
        />
      )}
    </div>
  );
}
