import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Administração",
  description: "Painel de administração da plataforma Jindungo.",
  path: "/admin",
  noIndex: true,
});

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminShell>{children}</AdminShell>;
}
