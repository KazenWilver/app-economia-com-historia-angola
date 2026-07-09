import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Autenticação",
  description: "Entra ou cria a tua conta na plataforma Jindungo.",
  path: "/login",
  noIndex: true,
});

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
