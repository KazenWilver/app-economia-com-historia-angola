import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Jindungo",
  description:
    "Conteúdos exclusivos da plataforma Jindungo sobre economia e história de Angola.",
  path: "/jindungo",
});

export default function JindungoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
