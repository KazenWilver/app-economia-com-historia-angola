"use client";

import { User, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mainNavLinks } from "@/components/layout/nav-links";
import { NavLink } from "@/components/layout/NavLink";
import { Navigation } from "@/components/layout/Navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, getFirstName } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-card/95 shadow-md backdrop-blur-md dark:border-border-dark dark:bg-surface-dark-card/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-extrabold text-bordeaux transition-opacity hover:opacity-90 dark:text-bordeaux-dark sm:text-xl"
        >
          <span aria-hidden>🌶️ </span>
          Jindungo
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Navegação principal"
        >
          {mainNavLinks.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isLoading && isAuthenticated && user ? (
            <>
              <span className="hidden text-sm text-content-secondary dark:text-content-dark-secondary md:inline">
                Olá,{" "}
                <span className="font-semibold text-content-primary dark:text-content-dark-primary">
                  {getFirstName(user.name)}
                </span>
              </span>
              <Link
                href="/explorar"
                className="hidden min-h-11 items-center rounded-lg px-3 font-display text-sm font-semibold text-content-primary transition-colors hover:bg-surface-secondary hover:text-bordeaux focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux md:inline-flex dark:text-content-dark-primary dark:hover:bg-surface-dark-secondary dark:hover:text-bordeaux-dark dark:focus-visible:outline-bordeaux-dark"
              >
                Explorar
              </Link>
              <Link
                href="/perfil"
                className="hidden min-h-11 items-center gap-2 rounded-lg px-3 font-display text-sm font-semibold text-content-primary transition-colors hover:bg-surface-secondary hover:text-bordeaux focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux md:inline-flex dark:text-content-dark-primary dark:hover:bg-surface-dark-secondary dark:hover:text-bordeaux-dark dark:focus-visible:outline-bordeaux-dark"
                aria-label="Perfil"
              >
                <User className="h-4 w-4" strokeWidth={1.5} />
                Perfil
              </Link>
              <Button
                type="button"
                variant="ghost"
                className="hidden min-h-11 md:inline-flex"
                onClick={() => void handleLogout()}
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Sair
              </Button>
            </>
          ) : !isLoading ? (
            <Link
              href="/login"
              className="hidden min-h-11 items-center rounded-lg bg-bordeaux px-4 font-display text-sm font-semibold text-white transition-colors hover:bg-bordeaux/90 md:inline-flex dark:bg-bordeaux-dark dark:hover:bg-bordeaux-dark/90"
            >
              Entrar
            </Link>
          ) : null}

          <Navigation links={mainNavLinks} isAuthenticated={isAuthenticated} userName={user ? getFirstName(user.name) : null} onLogout={() => void handleLogout()} />
        </div>
      </div>
    </header>
  );
}
