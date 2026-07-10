import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renderiza o texto e o estado de carregamento", () => {
    const { rerender } = render(<Button>Guardar</Button>);

    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();

    rerender(<Button isLoading>Guardar</Button>);

    const loadingButton = screen.getByRole("button", { name: "A carregar..." });
    expect(loadingButton).toBeDisabled();
    expect(loadingButton).toHaveAttribute("aria-busy", "true");
  });
});
