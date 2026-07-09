import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Quiz",
  description:
    "Testa o teu conhecimento sobre a economia e a história de Angola com quizzes interactivos.",
  path: "/quiz",
});

export default function QuizLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
