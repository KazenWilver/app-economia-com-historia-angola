import Link from "next/link";
import { mainNavLinks } from "@/components/layout/nav-links";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/80 bg-surface dark:border-border-dark/80 dark:bg-surface-dark">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div>
            <p className="font-display text-sm font-semibold tracking-display text-content-primary dark:text-content-dark-primary">
              Jindungo — Economia com História, Angola
            </p>
            <p className="mt-2 text-sm text-content-secondary dark:text-content-dark-secondary">
              ISPTEC · Engenharia de Software II · Grupo 6 · 2025/2026
            </p>
            <p className="mt-1 text-xs text-content-tertiary dark:text-content-dark-tertiary">
              Instituto Superior Politécnico de Tecnologias e Ciências
            </p>
          </div>

          <nav
            aria-label="Navegação do rodapé"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {mainNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display text-sm font-semibold tracking-display text-content-secondary transition-colors hover:text-bordeaux dark:text-content-dark-secondary dark:hover:text-bordeaux-dark"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <nav
            aria-label="Informação legal"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            <Link
              href="/privacidade"
              className="text-sm text-content-tertiary transition-colors hover:text-bordeaux dark:text-content-dark-tertiary dark:hover:text-bordeaux-dark"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="text-sm text-content-tertiary transition-colors hover:text-bordeaux dark:text-content-dark-tertiary dark:hover:text-bordeaux-dark"
            >
              Termos de utilização
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
