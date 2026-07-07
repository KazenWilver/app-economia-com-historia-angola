"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

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

export default function LoginPage() {
  const router = useRouter();
  const { login, setWelcomeMessage } = useAuth();
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof LoginForm, value: string) => {
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    setErrors(validateLoginForm(nextForm));
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
      const user = await login(form.email.trim(), form.password);
      setWelcomeMessage(user.name);
      router.push("/");
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível iniciar sessão.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card hoverLift={false} className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
        </CardHeader>

        <CardContent>
          {errors.form ? (
            <Toast
              variant="error"
              title="Erro ao entrar"
              message={errors.form}
              className="mb-4"
            />
          ) : null}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              error={errors.email}
              placeholder="utilizador@jindungo.ao"
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

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-content-secondary dark:text-content-dark-secondary">
            Ainda não tens conta?{" "}
            <Link
              href="/registar"
              className="font-semibold text-bordeaux hover:underline dark:text-bordeaux-dark"
            >
              Registar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
