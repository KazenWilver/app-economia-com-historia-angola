import { describe, expect, it } from "vitest";
import {
  buildRankingsQuery,
  formatRankingTime,
} from "@/components/ranking/ranking-types";

describe("formatRankingTime", () => {
  it("formata segundos e minutos", () => {
    expect(formatRankingTime(null)).toBe("—");
    expect(formatRankingTime(45)).toBe("45s");
    expect(formatRankingTime(125)).toBe("2m 05s");
  });
});

describe("buildRankingsQuery", () => {
  it("constrói a query com filtros activos", () => {
    expect(buildRankingsQuery({})).toBe("/rankings");
    expect(buildRankingsQuery({ quizId: "all", provinceId: "all" })).toBe(
      "/rankings",
    );
    expect(buildRankingsQuery({ quizId: "3", provinceId: "12" })).toBe(
      "/rankings?quiz_id=3&province_id=12",
    );
  });
});
