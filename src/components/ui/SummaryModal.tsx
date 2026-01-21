"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileDown, ClipboardCopy } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
interface SummaryModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  summary: string;
}

export default function SummaryModal({
  open,
  onClose,
  title,
  summary,
}: SummaryModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
    const wrapped = doc.splitTextToSize(
      summary.replace(/\*\*/g, ""),
      pageWidth
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(title, margin, 60);
    doc.setFontSize(12);
    doc.text(wrapped, margin, 100);
    doc.save(`${title || "summary"}.pdf`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-6 rounded-xl shadow-lg">
        <DialogHeader className="flex justify-between items-center mb-4">
          <DialogTitle className="text-xl font-semibold text-gray-800 flex items-center justify-between w-full">
            {title}
            {/* <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button> */}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-gray-50 border p-4 rounded-lg text-gray-700 text-sm max-h-[400px] overflow-y-auto prose prose-sm">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>

        <div className="flex justify-end mt-4 gap-3">
          <Button variant="outline" onClick={handleCopy}>
            <ClipboardCopy className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button onClick={handleDownload}>
            <FileDown className="w-4 h-4 mr-2" /> Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
