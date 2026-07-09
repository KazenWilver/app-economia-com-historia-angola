"use client";

import { LogOut, Menu, User, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
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
  const [mounted, setMounted] = useState(false);
  const drawerId = useId();
  const titleId = `${drawerId}-title`;

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const drawer =
    mounted && isOpen
      ? createPortal(
          <div className="fixed inset-0 z-[100] md:hidden" role="presentation">
            <button
              type="button"
              aria-label="Fechar menu"
              className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70"
              onClick={closeDrawer}
            />

            <aside
              id={drawerId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={cn(
                "absolute right-0 top-0 flex h-dvh w-[min(100%,20rem)] flex-col",
                "border-l border-border bg-white shadow-xl",
                "dark:border-border-dark dark:bg-surface-dark-card",
              )}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-border bg-white px-5 py-4 dark:border-border-dark dark:bg-surface-dark-card">
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

              <nav
                className="flex flex-1 flex-col gap-1 overflow-y-auto bg-white px-3 py-4 dark:bg-surface-dark-card"
                aria-label="Navegação principal"
              >
                {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeDrawer}
                    className={cn(
                      "flex min-h-11 items-center rounded-lg px-3 font-display text-base font-semibold",
                      "text-content-primary transition-colors",
                      "hover:bg-surface-secondary hover:text-bordeaux",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux",
                      "dark:text-content-dark-primary dark:hover:bg-surface-dark-secondary dark:hover:text-bordeaux-dark dark:focus-visible:outline-bordeaux-dark",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="shrink-0 space-y-3 border-t border-border bg-white px-5 py-5 dark:border-border-dark dark:bg-surface-dark-card">
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
                      href="/perfil"
                      onClick={closeDrawer}
                      className={cn(
                        "inline-flex min-h-11 w-full items-center gap-2 rounded-lg px-3 font-display text-sm font-semibold",
                        "text-content-primary transition-colors",
                        "hover:bg-surface-secondary hover:text-bordeaux",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux",
                        "dark:text-content-dark-primary dark:hover:bg-surface-dark-secondary dark:hover:text-bordeaux-dark dark:focus-visible:outline-bordeaux-dark",
                      )}
                    >
                      <User className="h-4 w-4" strokeWidth={1.5} />
                      Perfil
                    </Link>

                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-11 w-full justify-start"
                      onClick={() => {
                        closeDrawer();
                        onLogout?.();
                      }}
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.5} />
                      Sair
                    </Button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeDrawer}
                    className={cn(
                      "inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-bordeaux px-4",
                      "font-display text-sm font-semibold text-white transition-colors hover:bg-bordeaux/90",
                      "dark:bg-bordeaux-dark dark:hover:bg-bordeaux-dark/90",
                    )}
                  >
                    Entrar
                  </Link>
                )}
              </div>
            </aside>
          </div>,
          document.body,
        )
      : null;

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

      {drawer}
    </div>
  );
}
