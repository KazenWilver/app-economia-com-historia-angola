import { User } from "lucide-react";
import Link from "next/link";
import { mainNavLinks } from "@/components/layout/nav-links";
import { NavLink } from "@/components/layout/NavLink";
import { Navigation } from "@/components/layout/Navigation";

export function Header() {
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
          <Link
            href="/perfil"
            className="hidden min-h-11 items-center gap-2 rounded-lg px-3 font-display text-sm font-semibold text-content-primary transition-colors hover:bg-surface-secondary hover:text-bordeaux focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux md:inline-flex dark:text-content-dark-primary dark:hover:bg-surface-dark-secondary dark:hover:text-bordeaux-dark dark:focus-visible:outline-bordeaux-dark"
            aria-label="Perfil"
          >
            <User className="h-4 w-4" strokeWidth={1.5} />
            Perfil
          </Link>

          <Navigation links={mainNavLinks} />
        </div>
      </div>
    </header>
  );
}
