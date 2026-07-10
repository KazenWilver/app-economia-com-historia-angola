export interface AdminNavItem {
  href: string;
  label: string;
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/conteudos", label: "Conteúdos" },
  { href: "/admin/quizzes", label: "Quizzes" },
  { href: "/admin/forum", label: "Fórum" },
  { href: "/admin/mapa", label: "Mapa" },
  { href: "/admin/utilizadores", label: "Utilizadores" },
];
