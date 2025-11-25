"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Users, Target, BookOpen } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-6 md:px-16 lg:px-32">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          About <span className="text-blue-600">PrepzenX</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto mt-4 text-lg">
          Study smarter, not harder — your personal AI Tutor for notes, quizzes,
          and explanations.
        </p>
      </motion.div>

      {/* Mission Section */}
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-semibold mb-3 text-gray-800">
            Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed">
            At <strong>PrepzenX</strong>, our mission is to make learning more
            interactive, personalized, and enjoyable. We believe every student
            deserves an AI-powered study companion — one that can simplify
            complex topics, summarize notes, generate quizzes, and help prepare
            for exams efficiently.
          </p>
          <p className="text-gray-600 mt-3">
            Whether you’re revising for a test or exploring new concepts,
            PrepzenX adapts to your pace and learning style.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <Brain className="w-48 h-48 text-blue-500" />
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="mt-20">
        <h2 className="text-2xl font-semibold text-center mb-10 text-gray-800">
          What You Can Do with PrepzenX
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<BookOpen className="w-8 h-8 text-blue-600" />}
            title="Upload & Summarize Notes"
            description="Upload your study material and get instant, AI-generated summaries to revise faster."
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8 text-green-600" />}
            title="Generate Quizzes"
            description="Automatically create interactive quizzes to test your understanding."
          />
          <FeatureCard
            icon={<Target className="w-8 h-8 text-yellow-600" />}
            title="AI-Powered Chat Tutor"
            description="Ask questions, clear doubts, and get tailored explanations using your uploaded notes."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-purple-600" />}
            title="Progress Analytics"
            description="Track your learning progress with insights and gamified achievements."
          />
          <FeatureCard
            icon={<Brain className="w-8 h-8 text-pink-600" />}
            title="Personalized Learning"
            description="PrepzenX adapts to your style and strengths to help you focus where it matters most."
          />
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mt-20"
      >
        <h2 className="text-2xl font-semibold text-gray-800">
          Ready to make studying fun and smart?
        </h2>
        <p className="text-gray-600 mt-2 mb-6">
          Join PrepzenX today and let your AI Tutor take your learning to the
          next level.
        </p>
        <Button asChild size="lg" className="px-8 py-6 text-lg">
          <Link href="/login">Get Started</Link>
        </Button>
      </motion.div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
    >
      <Card className="shadow-md hover:shadow-lg border border-gray-100 transition bg-white">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <div className="mb-3">{icon}</div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
