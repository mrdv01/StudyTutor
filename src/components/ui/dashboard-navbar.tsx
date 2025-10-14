"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Menu } from "lucide-react";

const supabase = createClient();

export function DashboardNavbar({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* ☰ Mobile Sidebar Toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100"
            aria-label="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Dashboard Title */}
        <h1
          onClick={() => router.push("/dashboard")}
          className="text-lg md:text-xl font-semibold text-gray-800 cursor-pointer"
        >
          StudyWithAI Dashboard
        </h1>
      </div>

      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </header>
  );
}
