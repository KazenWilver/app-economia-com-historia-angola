import { describe, expect, it } from "vitest";
import type {
  ContentType,
  Province,
  QuizRecommendation,
  User,
} from "@shared/types";

describe("shared/types", () => {
  it("expõe contratos reutilizáveis entre módulos", () => {
    const contentType: ContentType = "texto";
    const province: Province = { id: 1, name: "Luanda", code: "LUA" };
    const user: User = {
      id: 1,
      name: "Ana",
      email: "ana@jindungo.ao",
      phone: null,
      role: "user",
      avatar_url: null,
      province_id: province.id,
      province,
    };
    const recommendation: QuizRecommendation = {
      id: 10,
      reason: "Rever este conteúdo",
      is_read: false,
      quiz_attempt_id: 3,
      content: {
        id: 5,
        title: "Petróleo em Angola",
        slug: "petroleo-em-angola",
        excerpt: null,
        type: contentType,
        media_url: null,
        is_exclusive: false,
        published_at: null,
        category: null,
      },
    };

    expect(user.province?.code).toBe("LUA");
    expect(recommendation.content.type).toBe("texto");
  });
});
