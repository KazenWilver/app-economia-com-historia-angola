import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Perfil",
  description: "Gere os teus dados pessoais e acede às recomendações da plataforma.",
  path: "/perfil",
  noIndex: true,
});

export default function PerfilLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
