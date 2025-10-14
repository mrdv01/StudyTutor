"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function UploadNotes() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // 👈 new ref

  const supabase = createClient();

  const handleUpload = async () => {
    if (!file) return alert("Please choose a file first.");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (data.text) {
      setText(data.text);

      // Get the logged-in user
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (userId) {
        await fetch("/api/save-note", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            title: file.name,
            content: data.text,
          }),
        });
      }
    } else alert("Error: " + data.error);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setText("");

    //  Reset actual input value too (important)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-xl shadow-md border border-gray-200 bg-white">
        <CardContent className="p-6 flex flex-col items-center gap-6">
          <h1 className="text-2xl font-semibold text-center">
            Upload Study Notes 📄
          </h1>

          {/* File Upload Area */}
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl p-8 cursor-pointer transition ${
              file
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <UploadCloud className="w-10 h-10 text-gray-500 mb-3" />
            <p className="text-gray-700 font-medium">
              {file ? "Change File" : "Choose a PDF or Drop it here"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              (Only PDF files are supported)
            </p>
            <input
              id="file-upload"
              type="file"
              ref={fileInputRef} //  attach ref
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) setFile(selected);
              }}
            />
          </label>

          {/* Show chosen file */}
          {file && (
            <div className="flex items-center justify-between w-full bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-700 truncate max-w-[80%]">
                📎 {file.name}
              </span>
              <button
                onClick={handleRemoveFile}
                className="text-red-500 hover:text-red-600 transition"
                title="Remove file"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full mt-2"
          >
            {loading ? "Processing..." : "Upload & Extract"}
          </Button>

          {/* Display extracted text */}
          {text && (
            <div className="mt-6 w-full bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-y-auto max-h-[350px]">
              <h2 className="font-semibold mb-2 text-gray-800">
                Extracted Text:
              </h2>
              <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {text}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
