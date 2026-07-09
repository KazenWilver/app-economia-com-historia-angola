import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="font-mono text-sm font-medium tracking-[0.2em] text-bordeaux dark:text-bordeaux-dark">
        404
      </p>

      <h1 className="mt-4 font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary sm:text-4xl">
        Página não encontrada
      </h1>

      <p className="mt-3 max-w-md text-content-secondary dark:text-content-dark-secondary">
        Este caminho não existe na plataforma Jindungo. Podes voltar ao início
        ou continuar a explorar os conteúdos.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-bordeaux px-5 font-display text-sm font-semibold text-white transition-colors hover:bg-bordeaux/90 dark:bg-bordeaux-dark dark:hover:bg-bordeaux-dark/90"
        >
          <Home className="h-4 w-4" strokeWidth={1.5} />
          Ir para o início
        </Link>

        <Link
          href="/explorar"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface-card px-5 font-display text-sm font-semibold text-content-primary transition-colors hover:border-bordeaux hover:text-bordeaux dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary dark:hover:border-bordeaux-dark dark:hover:text-bordeaux-dark"
        >
          <Compass className="h-4 w-4" strokeWidth={1.5} />
          Explorar conteúdos
        </Link>
      </div>
    </div>
  );
}
