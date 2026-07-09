import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Explorar",
  description:
    "Descobre textos, áudios, vídeos e podcasts sobre a economia e a história de Angola.",
  path: "/explorar",
});

export default function ExplorarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
