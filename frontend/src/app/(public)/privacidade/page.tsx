import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Privacidade",
  description:
    "Política de privacidade da plataforma Jindungo — Economia com História, Angola.",
  path: "/privacidade",
});

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
        Política de privacidade
      </h1>
      <p className="mt-3 text-sm text-content-tertiary dark:text-content-dark-tertiary">
        Última actualização: Julho de 2026 · Projecto académico ISPTEC
      </p>

      <div className="mt-8 space-y-6 text-base leading-relaxed text-content-secondary dark:text-content-dark-secondary">
        <section>
          <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            1. Quem somos
          </h2>
          <p className="mt-2">
            O Jindungo é uma plataforma educativa desenvolvida no âmbito da
            unidade curricular Engenharia de Software II (ISPTEC). Tratamos
            dados pessoais apenas para autenticação, personalização de
            conteúdos e funcionamento do fórum, quizzes e mapa.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            2. Dados que recolhemos
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Nome e endereço de e-mail no registo</li>
            <li>Palavra-passe (armazenada de forma cifrada)</li>
            <li>Actividade na plataforma (quizzes, comentários, tópicos)</li>
            <li>Preferências de perfil, quando as indicar</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            3. Finalidade
          </h2>
          <p className="mt-2">
            Utilizamos os dados para autenticar utilizadores, apresentar
            recomendações educativas, moderar o fórum e melhorar a experiência
            de aprendizagem. Não vendemos dados a terceiros.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            4. Conservação e segurança
          </h2>
          <p className="mt-2">
            Os dados residem na base de dados do projecto (MySQL) e são
            protegidos por autenticação Laravel Sanctum. Em ambiente académico,
            a conservação segue a duração do projecto curricular.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            5. Os seus direitos
          </h2>
          <p className="mt-2">
            Pode solicitar a actualização dos dados de perfil na página
            Perfil. Para eliminação de conta ou esclarecimentos, contacte a
            equipa do projecto através dos canais indicados no ISPTEC.
          </p>
        </section>
      </div>
    </article>
  );
}
