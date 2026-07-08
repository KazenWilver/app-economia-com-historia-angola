"use client";

import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

/**
 * Isola o painel admin: sessão própria, tema escuro forçado (classe `dark`),
 * sem Header/Footer do site público.
 */
export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminAuthProvider>
      <div className="dark min-h-screen bg-[#0F172A] text-[#F8FAFC]">
        {children}
      </div>
    </AdminAuthProvider>
  );
}
