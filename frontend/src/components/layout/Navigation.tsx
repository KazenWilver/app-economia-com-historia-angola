"use client";

import { Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { NavLink } from "@/components/layout/NavLink";
import type { NavLinkItem } from "@/components/layout/nav-links";
import { cn } from "@/lib/utils";

interface NavigationProps {
  links: NavLinkItem[];
  isAuthenticated?: boolean;
  userName?: string | null;
  onLogout?: () => void;
}

export function Navigation({
  links,
  isAuthenticated = false,
  userName = null,
  onLogout,
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerId = useId();
  const titleId = `${drawerId}-title`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const closeDrawer = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        aria-expanded={isOpen}
        aria-controls={drawerId}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        className="min-h-11 px-3"
        onClick={() => setIsOpen((open) => !open)}
      >
        {isOpen ? (
          <X className="h-5 w-5" strokeWidth={1.5} />
        ) : (
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        )}
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50" role="presentation">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-slate-950/60"
            onClick={closeDrawer}
          />

          <aside
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              "absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col",
              "border-l border-border bg-surface-card/95 p-6 shadow-glass backdrop-blur-xl",
              "animate-scale-in dark:border-border-dark dark:bg-surface-dark-card/95",
            )}
          >
            <div className="mb-8 flex items-center justify-between">
              <p
                id={titleId}
                className="font-display text-lg font-bold text-bordeaux dark:text-bordeaux-dark"
              >
                Menu
              </p>
              <Button
                type="button"
                variant="ghost"
                aria-label="Fechar menu"
                className="min-h-10 px-2"
                onClick={closeDrawer}
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            </div>

            <nav className="flex flex-col gap-5" aria-label="Navegação principal">
              {links.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  className="text-base"
                  onClick={closeDrawer}
                />
              ))}
            </nav>

            <div className="mt-auto space-y-4 border-t border-border pt-6 dark:border-border-dark">
              {isAuthenticated ? (
                <>
                  {userName ? (
                    <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
                      Olá,{" "}
                      <span className="font-semibold text-content-primary dark:text-content-dark-primary">
                        {userName}
                      </span>
                    </p>
                  ) : null}
                  <Link
                    href="/explorar"
                    onClick={closeDrawer}
                    className="inline-flex min-h-11 items-center font-display text-sm font-semibold text-content-primary hover:text-bordeaux dark:text-content-dark-primary dark:hover:text-bordeaux-dark"
                  >
                    Explorar
                  </Link>
                  <Link
                    href="/perfil"
                    onClick={closeDrawer}
                    className="inline-flex min-h-11 items-center gap-2 font-display text-sm font-semibold text-content-primary hover:text-bordeaux dark:text-content-dark-primary dark:hover:text-bordeaux-dark"
                  >
                    <User className="h-4 w-4" strokeWidth={1.5} />
                    Perfil
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11 w-full justify-start px-0"
                    onClick={() => {
                      closeDrawer();
                      onLogout?.();
                    }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeDrawer}
                  className="inline-flex min-h-11 items-center font-display text-sm font-semibold text-bordeaux dark:text-bordeaux-dark"
                >
                  Entrar
                </Link>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
