import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Fórum",
  description:
    "Participa nos debates da comunidade sobre economia e história de Angola.",
  path: "/forum",
});

export default function ForumLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
