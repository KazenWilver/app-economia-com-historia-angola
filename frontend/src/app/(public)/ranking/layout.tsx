import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Ranking",
  description:
    "Consulta a classificação nacional e regional dos quizzes da plataforma Jindungo.",
  path: "/ranking",
});

export default function RankingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
