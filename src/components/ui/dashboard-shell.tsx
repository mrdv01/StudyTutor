"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/ui/dashboard-sidebar";
import { Menu } from "lucide-react";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen max-h-screen bg-gray-50 overflow-hidden">
      {/* 🧭 Sidebar */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* 🧠 Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ☰ Mobile Toggle Button */}
        <header className="md:hidden flex items-center gap-2 p-4 border-b bg-white shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
