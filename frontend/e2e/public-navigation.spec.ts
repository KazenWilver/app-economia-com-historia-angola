import { expect, test } from "@playwright/test";

test.describe("Navegação pública", () => {
  test("landing e menu principal", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "Economia com História – Angola" }),
    ).toBeVisible();

    await expect(
      page.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeVisible();

    for (const label of ["Explorar", "Quiz", "Ranking", "Fórum", "Mapa"]) {
      await expect(
        page
          .getByRole("navigation", { name: "Navegação principal" })
          .getByRole("link", {
            name: label,
            exact: true,
          }),
      ).toBeVisible();
    }
  });

  test("páginas principais carregam títulos esperados", async ({ page }) => {
    const routes: Array<{ path: string; heading: string }> = [
      { path: "/explorar", heading: "Explorar Conteúdos" },
      { path: "/quiz", heading: "Quizzes" },
      { path: "/ranking", heading: "Classificação" },
      { path: "/forum", heading: "Fórum" },
      { path: "/mapa", heading: "Mapa Interactivo" },
      { path: "/login", heading: "Entrar" },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(
        page.getByRole("heading", { name: route.heading }),
      ).toBeVisible();
    }
  });

  test("rota inexistente mostra página 404", async ({ page }) => {
    await page.goto("/rota-inexistente-jindungo");

    await expect(
      page.getByRole("heading", { name: "Página não encontrada" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Ir para o início" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explorar conteúdos" }),
    ).toBeVisible();
  });

  test("perfil redirecciona visitantes para login", async ({ page }) => {
    await page.goto("/perfil");
    await expect(page).toHaveURL(/\/login/);
  });
});
