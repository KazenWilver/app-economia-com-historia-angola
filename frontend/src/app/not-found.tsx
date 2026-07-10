import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="font-mono text-sm font-medium tracking-[0.2em] text-bordeaux dark:text-bordeaux-dark">
        404
      </p>

      <h1 className="mt-4 font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary sm:text-4xl">
        Página não encontrada
      </h1>

      <p className="mt-3 max-w-md text-content-secondary dark:text-content-dark-secondary">
        Este caminho não existe na plataforma Jindungo. Podes voltar ao início
        ou continuar a explorar os conteúdos.
      </p>

      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/">
          <Button type="button" className="w-full sm:w-auto">
            <Home className="h-4 w-4" strokeWidth={1.5} />
            Ir para o início
          </Button>
        </Link>

        <Link href="/explorar">
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            <Compass className="h-4 w-4" strokeWidth={1.5} />
            Explorar conteúdos
          </Button>
        </Link>
      </div>
    </div>
  );
}
