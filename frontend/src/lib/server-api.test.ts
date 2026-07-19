import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { serverApiFetch } from "@/lib/server-api";

describe("serverApiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [{ id: 1 }] }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("devolve dados quando a API responde 200", async () => {
    const result = await serverApiFetch<{ data: { id: number }[] }>("/contents");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.data[0]?.id).toBe(1);
    }
  });

  it("devolve ok=false em erros HTTP", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({}),
      }),
    );

    const result = await serverApiFetch("/contents/em-falta");

    expect(result.ok).toBe(false);
    expect(result.status).toBe(404);
  });

  it("devolve status 0 quando a rede falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network")),
    );

    const result = await serverApiFetch("/contents");

    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
  });
});
