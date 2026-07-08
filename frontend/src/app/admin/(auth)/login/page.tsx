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

interface LoginForm {
  email: string;
  password: string;
}

interface LoginErrors {
  email?: string;
  password?: string;
  form?: string;
}

function validateLoginForm(values: LoginForm): LoginErrors {
  const errors: LoginErrors = {};

  if (!values.email.trim()) {
    errors.email = "O email é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "O email deve ser válido.";
  }

  if (!values.password) {
    errors.password = "A palavra-passe é obrigatória.";
  }

  return errors;
}

const inputClassName =
  "border-slate-600 bg-slate-950 text-[#F8FAFC] placeholder:text-slate-500 focus:border-bordeaux-dark focus:ring-bordeaux-dark/30";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAdmin, isLoading } = useAdminAuth();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      router.replace("/admin");
    }
  }, [isAdmin, isLoading, router]);

  const handleChange = (field: keyof LoginForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await login(form.email.trim(), form.password);
      router.replace("/admin");
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível iniciar sessão no painel.",
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
        <CardTitle className="text-[#F8FAFC]">Entrar no painel</CardTitle>
        <p className="text-sm text-slate-300">
          Área reservada a administradores. A sessão do site público não é
          utilizada aqui.
        </p>
      </CardHeader>

      <CardContent className="text-slate-300">
        {errors.form ? (
          <Toast
            variant="error"
            title="Erro ao entrar"
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
            label="Email de administrador"
            name="email"
            type="email"
            autoComplete="username"
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
            autoComplete="current-password"
            value={form.password}
            error={errors.password}
            placeholder="••••••••"
            labelClassName="text-[#F8FAFC]"
            className={inputClassName}
            onChange={(event) => handleChange("password", event.target.value)}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Entrar no painel
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Precisas de criar um administrador?{" "}
          <Link
            href="/admin/registar"
            className="font-semibold text-bordeaux-dark hover:underline"
          >
            Registar administrador
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
