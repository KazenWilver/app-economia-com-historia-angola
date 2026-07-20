"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  Map,
  MessageSquare,
  Puzzle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { adminNavItems } from "@/components/admin/admin-nav";
import { cn } from "@/lib/utils";

const iconByHref: Record<string, typeof LayoutDashboard> = {
  "/admin": LayoutDashboard,
  "/admin/conteudos": BookOpen,
  "/admin/quizzes": Puzzle,
  "/admin/forum": MessageSquare,
  "/admin/mapa": Map,
  "/admin/pedidos-jindungo": ShieldCheck,
  "/admin/utilizadores": Users,
};

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-b border-border bg-surface-card md:h-screen md:w-64 md:border-b-0 md:border-r dark:border-border-dark dark:bg-surface-dark">
      <div className="border-b border-border px-5 py-5 dark:border-border-dark">
        <Link
          href="/admin"
          className="font-display text-base font-extrabold leading-tight text-bordeaux dark:text-bordeaux-dark"
        >
          Economia com História
          <span className="mt-0.5 block text-xs font-semibold tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
            Administração
          </span>
        </Link>
      </div>

      <nav
        className="flex gap-2 overflow-x-auto px-3 py-4 md:flex-col md:overflow-visible"
        aria-label="Navegação do admin"
      >
        {adminNavItems.map((item) => {
          const Icon = iconByHref[item.href] ?? LayoutDashboard;
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 font-display text-sm font-semibold transition-colors duration-200",
                isActive
                  ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                  : "text-content-secondary hover:bg-surface-secondary hover:text-content-primary dark:text-content-dark-secondary dark:hover:bg-surface-dark-secondary dark:hover:text-content-dark-primary",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-border px-5 py-4 md:block dark:border-border-dark">
        <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
          Sessão isolada do painel. O site público mantém a sua própria conta.
        </p>
      </div>
    </aside>
  );
}
