"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-bordeaux focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        Saltar para o conteúdo
      </a>
      <Header />
      <main id="conteudo-principal" className="flex flex-1 flex-col" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </>
  );
}
