import { describe, expect, it, vi, afterEach } from "vitest";
import {
  formatMediaTime,
  resolveMediaUrl,
} from "@/components/content/media-player-utils";

describe("resolveMediaUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("converte caminhos /storage e /api/media para URL estática /storage", () => {
    expect(resolveMediaUrl("/storage/contents/a.mp3")).toBe(
      "http://localhost:8000/storage/contents/a.mp3",
    );
    expect(resolveMediaUrl("/api/media/contents/a.mp3")).toBe(
      "http://localhost:8000/storage/contents/a.mp3",
    );
  });

  it("mantém blob: e URLs externas", () => {
    expect(resolveMediaUrl("blob:http://localhost/x")).toBe(
      "blob:http://localhost/x",
    );
    expect(resolveMediaUrl("https://cdn.example/file.mp4")).toBe(
      "https://cdn.example/file.mp4",
    );
  });
});

describe("formatMediaTime", () => {
  it("formata segundos em m:ss", () => {
    expect(formatMediaTime(0)).toBe("0:00");
    expect(formatMediaTime(65)).toBe("1:05");
  });
});
