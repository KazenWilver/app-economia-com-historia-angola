"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { resetPassword } from "@/lib/auth-password";
import { cn } from "@/lib/utils";

export interface ResetPasswordFormProps {
  defaultLoginHref: string;
  variant?: "public" | "admin";
}

function resolveLoginHref(
  redirect: string | null,
  fallback: string,
): string {
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return fallback;
  }

  return redirect;
}

function ResetPasswordFormContent({
  defaultLoginHref,
  variant = "public",
}: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = variant === "admin";

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const loginHref = useMemo(
    () => resolveLoginHref(searchParams.get("redirect"), defaultLoginHref),
    [defaultLoginHref, searchParams],
  );

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    if (!token || !email) {
      setError("O link de recuperação é inválido ou expirou. Pede um novo pedido.");
      return;
    }

    if (!password) {
      setError("A palavra-passe é obrigatória.");
      return;
    }

    if (password.length < 8) {
      setError("A palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("A confirmação da palavra-passe não coincide.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        email,
        token,
        password,
        passwordConfirmation,
      });
      router.replace(loginHref);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível redefinir a palavra-passe.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      hoverLift={false}
      className={cn(
        "w-full max-w-md",
        isAdmin && "border-slate-700 bg-slate-900 text-[#F8FAFC]",
      )}
    >
      <CardHeader>
        <CardTitle className={isAdmin ? "text-[#F8FAFC]" : undefined}>
          Redefinir palavra-passe
        </CardTitle>
        <p
          className={cn(
            "text-sm",
            isAdmin
              ? "text-slate-300"
              : "text-content-secondary dark:text-content-dark-secondary",
          )}
        >
          Escolhe uma nova palavra-passe para a conta{" "}
          <span className="font-medium">{email || "associada"}</span>.
        </p>
      </CardHeader>

      <CardContent className={isAdmin ? "text-slate-300" : undefined}>
        {error ? (
          <Toast variant="error" title="Erro" message={error} className="mb-4" />
        ) : null}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Input
            label="Nova palavra-passe"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            placeholder="••••••••"
            labelClassName={isAdmin ? "text-[#F8FAFC]" : undefined}
            className={
              isAdmin
                ? "border-slate-600 bg-slate-950 text-[#F8FAFC] placeholder:text-slate-500 focus:border-bordeaux-dark focus:ring-bordeaux-dark/30"
                : undefined
            }
            onChange={(event) => setPassword(event.target.value)}
          />

          <Input
            label="Confirmar palavra-passe"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            value={passwordConfirmation}
            placeholder="••••••••"
            labelClassName={isAdmin ? "text-[#F8FAFC]" : undefined}
            className={
              isAdmin
                ? "border-slate-600 bg-slate-950 text-[#F8FAFC] placeholder:text-slate-500 focus:border-bordeaux-dark focus:ring-bordeaux-dark/30"
                : undefined
            }
            onChange={(event) => setPasswordConfirmation(event.target.value)}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Guardar nova palavra-passe
          </Button>
        </form>

        <p
          className={cn(
            "mt-6 text-center text-sm",
            isAdmin
              ? "text-slate-400"
              : "text-content-secondary dark:text-content-dark-secondary",
          )}
        >
          <Link
            href={loginHref}
            className="font-semibold text-bordeaux hover:underline dark:text-bordeaux-dark"
          >
            Voltar ao início de sessão
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export function ResetPasswordForm(props: ResetPasswordFormProps) {
  return (
    <Suspense
      fallback={
        <Card hoverLift={false} className="w-full max-w-md">
          <CardContent className="py-10 text-center text-sm text-content-secondary">
            A carregar…
          </CardContent>
        </Card>
      }
    >
      <ResetPasswordFormContent {...props} />
    </Suspense>
  );
}
