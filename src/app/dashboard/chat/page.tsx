"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient(); // init Supabase client
  const searchParams = useSearchParams();
  const noteId = searchParams.get("noteId");
  const [noteTitle, setNoteTitle] = useState<string | null>(null);
  const router = useRouter();

  //  Fetch logged-in user once
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchNoteTitle = async () => {
      if (!noteId) return;
      const { data, error } = await supabase
        .from("notes")
        .select("title")
        .eq("id", noteId)
        .single();

      if (!error && data) setNoteTitle(data.title);
    };
    fetchNoteTitle();
  }, [noteId]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userId,
          noteId,
        }),
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiText = "";

      // Add placeholder for streaming AI message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiText += decoder.decode(value, { stream: true });

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = aiText;
          return updated;
        });
      }
    } catch (err) {
      console.error("Stream error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error: failed to get response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="flex flex-col h-[85vh] w-full md:max-w-2xl mx-auto bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b bg-white shadow-sm sticky top-0 z-10">
        {noteId && (
          <button
            onClick={() => router.push("/dashboard/notes")}
            className="absolute left-3 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-blue-600 hover:text-blue-800 transition"
          >
            ← Back
          </button>
        )}
        <h1 className="text-lg font-semibold text-center">AI Tutor Chat</h1>
        {noteId && (
          <p className="text-sm text-gray-500 text-center mt-1">
            Chatting about <strong>{noteTitle || "this note"}</strong>
          </p>
        )}
      </div>

      {/* Chat messages (scrollable area) */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[65vh]"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-2 px-3 rounded-lg max-w-[80%] text-sm whitespace-pre-wrap break-words ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}

        {loading && (
          <p className="text-gray-500 text-sm italic">AI is thinking...</p>
        )}
      </div>

      {/* Sticky Input Bar */}
      <div className="sticky bottom-0 bg-white border-t p-3 flex items-center gap-2">
        <Input
          placeholder="Ask your tutor..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}
