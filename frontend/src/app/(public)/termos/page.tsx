import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Termos de utilização",
  description:
    "Termos de utilização da plataforma Jindungo — Economia com História, Angola.",
  path: "/termos",
});

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
        Termos de utilização
      </h1>
      <p className="mt-3 text-sm text-content-tertiary dark:text-content-dark-tertiary">
        Última actualização: Julho de 2026 · Projecto académico ISPTEC
      </p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-content-secondary dark:text-content-dark-secondary">
        <section>
          <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            1. Objecto
          </h2>
          <p className="mt-2">
            Estes termos regulam o acesso à plataforma Jindungo, destinada a
            conteúdos educativos sobre economia e história de Angola (vídeos,
            áudio, quizzes, fórum e mapa interactivo).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            2. Conta de utilizador
          </h2>
          <p className="mt-2">
            É responsável pela confidencialidade das suas credenciais e pela
            exactidão das informações de perfil. O uso indevido da conta pode
            resultar em suspensão no âmbito do projecto académico.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            3. Conduta no fórum
          </h2>
          <p className="mt-2">
            Os contributos devem ser respeitosos, relevantes e alinhados com o
            carácter educativo da plataforma. Conteúdos ofensivos, discriminatórios
            ou ilegais podem ser removidos pelos administradores.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            4. Propriedade intelectual
          </h2>
          <p className="mt-2">
            Os materiais educativos disponibilizados destinam-se a uso
            educacional. A reprodução comercial sem autorização não é permitida.
            Narrativas e dados geográficos citam fontes públicas e legislação
            angolana (Lei n.º 14/24).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            5. Limitação
          </h2>
          <p className="mt-2">
            A plataforma é um protótipo académico. Não garantimos disponibilidade
            contínua nem exactidão cartográfica oficial completa das fronteiras
            das novas províncias enquanto não existir ADM1 aberto actualizado.
          </p>
        </section>
      </div>
    </article>
  );
}
