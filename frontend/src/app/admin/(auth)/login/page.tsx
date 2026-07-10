"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthTransitionScreen } from "@/components/auth/AuthTransitionScreen";
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

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAdmin, isLoading, user } = useAdminAuth();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      setIsTransitioning(true);
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
      setIsTransitioning(true);
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

  if (isLoading || isTransitioning || isAdmin) {
    return <AuthTransitionScreen variant="admin" userName={user?.name ?? form.email.split("@")[0]} />;
  }

  return (
    <Card
      hoverLift={false}
      className="w-full max-w-md border-border bg-surface-card text-content-primary dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary"
    >
      <CardHeader>
        <CardTitle className="text-content-primary dark:text-content-dark-primary">
          Entrar no painel
        </CardTitle>
        <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
          Área reservada a administradores. A sessão do site público não é
          utilizada aqui.
        </p>
      </CardHeader>

      <CardContent className="text-content-secondary dark:text-content-dark-secondary">
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
            onChange={(event) => handleChange("password", event.target.value)}
          />

          <div className="text-right">
            <Link
              href="/admin/recuperar-palavra-passe"
              className="text-sm font-medium text-bordeaux hover:underline dark:text-bordeaux-dark"
            >
              Esqueci a palavra-passe
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Entrar no painel
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-content-tertiary dark:text-content-dark-tertiary">
          Precisas de criar um administrador?{" "}
          <Link
            href="/admin/registar"
            className="font-semibold text-bordeaux hover:underline dark:text-bordeaux-dark"
          >
            Registar administrador
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
