"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Upload,
  BookOpen,
  Settings,
  X,
  ClipboardList,
  HelpCircle,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Upload Notes", href: "/dashboard/upload", icon: Upload },
  { name: "My Notes", href: "/dashboard/notes", icon: BookOpen },
  { name: "Saved Quizzes", href: "/dashboard/quizzes", icon: ClipboardList },
  { name: "Saved Q&A", href: "/dashboard/qa/saved", icon: HelpCircle },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* 🩶 Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 📁 Sidebar Panel */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-md md:shadow-none z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Header for mobile */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close Menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map(({ name, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={name}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 p-2 rounded-lg transition ${
                  active
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
