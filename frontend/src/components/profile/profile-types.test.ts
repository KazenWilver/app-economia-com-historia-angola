import { describe, expect, it } from "vitest";
import {
  buildProfileFormValues,
  buildProfileUpdatePayload,
  validateProfileForm,
} from "@/components/profile/profile-types";

describe("validateProfileForm", () => {
  it("aceita um formulário válido", () => {
    const errors = validateProfileForm({
      name: "Julieta Silva",
      email: "julieta@jindungo.ao",
      phone: "+244900000000",
      provinceId: "5",
      avatarUrl: "https://cdn.jindungo.ao/avatar.png",
    });

    expect(errors).toEqual({});
  });

  it("rejeita campos obrigatórios em falta", () => {
    const errors = validateProfileForm({
      name: " ",
      email: "",
      phone: "",
      provinceId: "",
      avatarUrl: "",
    });

    expect(errors.name).toBe("O nome é obrigatório.");
    expect(errors.email).toBe("O email é obrigatório.");
    expect(errors.provinceId).toBe("A província é obrigatória.");
  });

  it("rejeita email e avatar inválidos", () => {
    const errors = validateProfileForm({
      name: "Maria",
      email: "email-invalido",
      phone: "",
      provinceId: "1",
      avatarUrl: "avatar-sem-protocolo",
    });

    expect(errors.email).toBe("O email deve ser válido.");
    expect(errors.avatarUrl).toBe("O avatar deve ser um URL válido.");
  });
});

describe("buildProfileFormValues / buildProfileUpdatePayload", () => {
  it("mapeia o utilizador para o formulário", () => {
    expect(
      buildProfileFormValues({
        name: "Ana",
        email: "ana@jindungo.ao",
        phone: null,
        province_id: 3,
        avatar_url: null,
      }),
    ).toEqual({
      name: "Ana",
      email: "ana@jindungo.ao",
      phone: "",
      provinceId: "3",
      avatarUrl: "",
    });
  });

  it("prepara o payload da API", () => {
    expect(
      buildProfileUpdatePayload({
        name: " Ana ",
        email: " ana@jindungo.ao ",
        phone: " ",
        provinceId: "7",
        avatarUrl: " https://cdn.jindungo.ao/a.png ",
      }),
    ).toEqual({
      name: "Ana",
      email: "ana@jindungo.ao",
      phone: null,
      province_id: 7,
      avatar_url: "https://cdn.jindungo.ao/a.png",
    });
  });
});
