/**
 * Equipa — Economia com História – Angola (Grupo 6 · ISPTEC).
 */

export interface TeamMember {
  name: string;
  role: string;
  focus: string;
  email?: string;
}

export const PROJECT_ABOUT = {
  product: "Economia com História – Angola",
  codename: "Jindungo",
  institution: "Instituto Superior Politécnico de Tecnologias e Ciências (ISPTEC)",
  course: "Engenharia de Software II",
  group: "Grupo 6",
  academicYear: "2025/2026",
  tagline:
    "Plataforma educativa multimédia sobre a economia e a história de Angola — web, administração e aplicação móvel.",
  mission:
    "Tornar acessível, de forma interactiva e rigorosa, o conhecimento sobre a economia e a história de Angola, através de conteúdos multimédia, trilho educativo, tutor com IA, quizzes, fórum, mapa provincial e biblioteca exclusiva Jindungo.",
  stack:
    "Backend Laravel (API REST + Sanctum), frontend Next.js, app móvel Expo/React Native, base de dados MySQL/PostgreSQL.",
} as const;

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Willfredy Vieira Dias",
    role: "Engenharia full-stack · backend e web",
    focus:
      "API Laravel, Docker/CI, design system, autenticação, landing, painel de administração (conteúdos e utilizadores).",
    email: "starkeliude90@gmail.com",
  },
  {
    name: "Manuel Sulo",
    role: "Engenharia full-stack · web e mobile",
    focus:
      "Setup Next.js/Expo, tipos partilhados, cliente API, Quiz, Fórum, Mapa interactivo, documentação e paridade mobile.",
    email: "20221465@isptec.co.ao",
  },
  {
    name: "Eduarda",
    role: "Desenvolvimento mobile",
    focus:
      "Contribuições na aplicação móvel Expo (experiência nativa, ecrãs e integração com a API).",
    email: "Adraude2694@gmail.com",
  },
  {
    name: "Adelino",
    role: "Desenvolvimento mobile",
    focus:
      "Contribuições na aplicação móvel Expo (fluxos de utilizador, UI e testes em dispositivo).",
    email: "adelinodo003@gmail.com",
  },
];

export const TEAM_CREDIT_LINE =
  "Criado pelo Grupo 6 · ISPTEC · ES II · 2025/2026 — Willfredy Vieira Dias, Manuel Sulo, Eduarda e Adelino";

export const TEAM_CREDIT_SHORT =
  "Willfredy Vieira Dias · Manuel Sulo · Eduarda · Adelino · Grupo 6 ISPTEC";
