import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Trilho",
  description:
    "Segue o percurso educativo: conteúdos, quizzes, mapa e fórum de Economia com História – Angola.",
  path: "/trilho",
});

export default function LearningPathLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
