import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Welcome to AI Tutor Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Learn smarter with AI-powered summaries and quizzes.
      </p>
      <div className="flex gap-4">
        <Link href="/sign-in">
          <Button className="cursor-pointer">Sign In</Button>
        </Link>
        <Link href="/sign-up">
          <Button variant="outline" className="cursor-pointer">
            Sign Up
          </Button>
        </Link>
      </div>
    </div>
  );
}
