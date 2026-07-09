import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Mapa",
  description:
    "Explora o mapa interactivo das províncias de Angola e as suas narrativas económicas.",
  path: "/mapa",
});

export default function MapaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
