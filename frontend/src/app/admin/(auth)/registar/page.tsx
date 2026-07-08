"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  adminKey: string;
}

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  adminKey?: string;
  form?: string;
}

function validateRegisterForm(values: RegisterForm): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!values.name.trim()) {
    errors.name = "O nome é obrigatório.";
  }

  if (!values.email.trim()) {
    errors.email = "O email é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "O email deve ser válido.";
  }

  if (!values.password) {
    errors.password = "A palavra-passe é obrigatória.";
  } else if (values.password.length < 8) {
    errors.password = "A palavra-passe deve ter pelo menos 8 caracteres.";
  }

  if (!values.passwordConfirmation) {
    errors.passwordConfirmation =
      "A confirmação da palavra-passe é obrigatória.";
  } else if (values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation =
      "A confirmação da palavra-passe não coincide.";
  }

  if (!values.adminKey.trim()) {
    errors.adminKey = "A chave de administrador é obrigatória.";
  }

  return errors;
}

const inputClassName =
  "border-slate-600 bg-slate-950 text-[#F8FAFC] placeholder:text-slate-500 focus:border-bordeaux-dark focus:ring-bordeaux-dark/30";

export default function AdminRegisterPage() {
  const router = useRouter();
  const { register, isAdmin, isLoading } = useAdminAuth();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    adminKey: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, isLoading, router]);

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await register(
        form.name.trim(),
        form.email.trim(),
        form.password,
        form.passwordConfirmation,
        form.adminKey.trim(),
      );
      router.replace("/admin");
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível concluir o registo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAdmin) {
    return (
      <Card
        hoverLift={false}
        className="w-full max-w-md border-slate-700 bg-slate-900 text-[#F8FAFC]"
      >
        <CardContent className="py-10 text-center text-sm text-slate-300">
          A verificar sessão do painel…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      hoverLift={false}
      className="w-full max-w-md border-slate-700 bg-slate-900 text-[#F8FAFC]"
    >
      <CardHeader>
        <CardTitle className="text-[#F8FAFC]">
          Registar administrador
        </CardTitle>
        <p className="text-sm text-slate-300">
          Cria uma conta exclusiva do painel. Não afecta a sessão do site
          público.
        </p>
      </CardHeader>

      <CardContent className="text-slate-300">
        {errors.form ? (
          <Toast
            variant="error"
            title="Erro no registo"
            message={errors.form}
            className="mb-4"
          />
        ) : null}

        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <Input
            label="Nome"
            name="name"
            autoComplete="name"
            value={form.name}
            error={errors.name}
            placeholder="Nome do administrador"
            labelClassName="text-[#F8FAFC]"
            className={inputClassName}
            onChange={(event) => handleChange("name", event.target.value)}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            error={errors.email}
            placeholder="admin@jindungo.ao"
            labelClassName="text-[#F8FAFC]"
            className={inputClassName}
            onChange={(event) => handleChange("email", event.target.value)}
          />

          <Input
            label="Palavra-passe"
            name="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            error={errors.password}
            placeholder="Mínimo 8 caracteres"
            labelClassName="text-[#F8FAFC]"
            className={inputClassName}
            onChange={(event) => handleChange("password", event.target.value)}
          />

          <Input
            label="Confirmar palavra-passe"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            value={form.passwordConfirmation}
            error={errors.passwordConfirmation}
            placeholder="Repete a palavra-passe"
            labelClassName="text-[#F8FAFC]"
            className={inputClassName}
            onChange={(event) =>
              handleChange("passwordConfirmation", event.target.value)
            }
          />

          <Input
            label="Chave de administrador"
            name="adminKey"
            type="password"
            autoComplete="off"
            value={form.adminKey}
            error={errors.adminKey}
            placeholder="Chave fornecida pela equipa"
            labelClassName="text-[#F8FAFC]"
            className={inputClassName}
            onChange={(event) => handleChange("adminKey", event.target.value)}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Criar conta de administrador
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Já tens conta?{" "}
          <Link
            href="/admin/login"
            className="font-semibold text-bordeaux-dark hover:underline"
          >
            Entrar no painel
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
