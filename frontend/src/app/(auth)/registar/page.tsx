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
import { useAuth } from "@/hooks/useAuth";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

interface RegisterErrors {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
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
    errors.passwordConfirmation = "A confirmação da palavra-passe é obrigatória.";
  } else if (values.password !== values.passwordConfirmation) {
    errors.passwordConfirmation =
      "A confirmação da palavra-passe não coincide.";
  }

  return errors;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register, setWelcomeMessage, isAuthenticated, isLoading } = useAuth();
  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/explorar");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleChange = (field: keyof RegisterForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }));
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
      const user = await register(
        form.name.trim(),
        form.email.trim(),
        form.password,
        form.passwordConfirmation,
      );
      setWelcomeMessage(user.name);
      router.replace("/explorar");
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

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card hoverLift={false} className="w-full max-w-md">
          <CardContent className="py-10 text-center text-sm text-content-secondary">
            A redirecionar…
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card hoverLift={false} className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
        </CardHeader>

        <CardContent>
          {errors.form ? (
            <Toast
              variant="error"
              title="Erro no registo"
              message={errors.form}
              className="mb-4"
            />
          ) : null}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Nome"
              name="name"
              autoComplete="name"
              value={form.name}
              error={errors.name}
              placeholder="O teu nome"
              onChange={(event) => handleChange("name", event.target.value)}
            />

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
              autoComplete="new-password"
              value={form.password}
              error={errors.password}
              placeholder="Mínimo 8 caracteres"
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
              onChange={(event) =>
                handleChange("passwordConfirmation", event.target.value)
              }
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Registar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-content-secondary dark:text-content-dark-secondary">
            Já tens conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-bordeaux hover:underline dark:text-bordeaux-dark"
            >
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
