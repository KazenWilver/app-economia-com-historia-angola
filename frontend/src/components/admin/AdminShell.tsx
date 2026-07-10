"use client";

import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

/**
 * Isola o painel admin: sessão própria, sem Header/Footer do site público.
 * O tema claro/escuro segue o ThemeProvider global (mesmo toggle do site).
 */
export function AdminShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-surface text-content-primary dark:bg-surface-dark dark:text-content-dark-primary">
        {children}
      </div>
    </AdminAuthProvider>
  );
}
