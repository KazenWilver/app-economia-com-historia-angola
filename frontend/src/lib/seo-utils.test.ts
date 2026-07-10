import { describe, expect, it } from "vitest";
import { createPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("une classes e resolve conflitos do Tailwind", () => {
    expect(cn("px-2", "px-4", false && "hidden", "text-sm")).toBe(
      "px-4 text-sm",
    );
  });
});

describe("createPageMetadata", () => {
  it("gera metadata com Open Graph e canónico", () => {
    const metadata = createPageMetadata({
      title: "Quiz",
      description: "Testa o teu conhecimento.",
      path: "/quiz",
    });

    expect(metadata.title).toBe("Quiz");
    expect(metadata.description).toBe("Testa o teu conhecimento.");
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/quiz");
    expect(metadata.openGraph?.title).toBe("Quiz | Jindungo");
    expect(metadata.robots).toBeUndefined();
  });

  it("marca páginas privadas como noIndex", () => {
    const metadata = createPageMetadata({
      title: "Perfil",
      description: "Área privada.",
      path: "/perfil",
      noIndex: true,
    });

    expect(metadata.robots).toEqual({
      index: false,
      follow: false,
    });
  });
});
