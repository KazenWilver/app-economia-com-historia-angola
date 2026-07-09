"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useRef, useState } from "react";
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
  forgotPasswordHref: string;
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
  forgotPasswordHref,
  variant = "public",
}: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const isAdmin = variant === "admin";

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";
  const loginHref = useMemo(
    () => resolveLoginHref(searchParams.get("redirect"), defaultLoginHref),
    [defaultLoginHref, searchParams],
  );
  const invalidLink = !token || !email;

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmittingRef.current || invalidLink) {
      return;
    }

    setError(undefined);

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

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      await resetPassword({
        email,
        token,
        password,
        passwordConfirmation,
      });
      setIsSuccess(true);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível redefinir a palavra-passe.",
      );
    } finally {
      isSubmittingRef.current = false;
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
          Nova palavra-passe
        </CardTitle>
        <p
          className={cn(
            "text-sm",
            isAdmin
              ? "text-slate-300"
              : "text-content-secondary dark:text-content-dark-secondary",
          )}
        >
          Define uma nova palavra-passe para a tua conta Jindungo.
        </p>
      </CardHeader>

      <CardContent className={isAdmin ? "text-slate-300" : undefined}>
        {invalidLink ? (
          <div className="space-y-4">
            <Toast
              variant="error"
              title="Link inválido"
              message="O link está incompleto ou expirou. Pede um novo link de recuperação."
            />
            <Link
              href={forgotPasswordHref}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-petrol px-4 py-2.5 font-display text-sm font-semibold text-white transition-all duration-200 hover:bg-petrol/90 dark:bg-petrol-dark dark:hover:bg-petrol-dark/90"
            >
              Pedir novo link
            </Link>
          </div>
        ) : null}

        {!invalidLink && isSuccess ? (
          <div className="space-y-4">
            <Toast
              variant="success"
              title="Palavra-passe redefinida"
              message="Palavra-passe redefinida com sucesso. Já podes iniciar sessão."
            />
            <Link
              href={loginHref}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-bordeaux px-4 py-2.5 font-display text-sm font-semibold text-white transition-all duration-200 hover:bg-bordeaux/90 dark:bg-bordeaux-dark dark:hover:bg-bordeaux-dark/90"
            >
              Ir para o início de sessão
            </Link>
          </div>
        ) : null}

        {!invalidLink && !isSuccess ? (
          <>
            {error ? (
              <Toast variant="error" title="Erro" message={error} className="mb-4" />
            ) : null}

            <p className="mb-4 text-sm text-content-secondary dark:text-content-dark-secondary">
              Conta: <span className="font-medium">{email}</span>
            </p>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
              <Input
                label="Nova palavra-passe"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                placeholder="Mínimo 8 caracteres"
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
                placeholder="Repete a palavra-passe"
                labelClassName={isAdmin ? "text-[#F8FAFC]" : undefined}
                className={
                  isAdmin
                    ? "border-slate-600 bg-slate-950 text-[#F8FAFC] placeholder:text-slate-500 focus:border-bordeaux-dark focus:ring-bordeaux-dark/30"
                    : undefined
                }
                onChange={(event) => setPasswordConfirmation(event.target.value)}
              />

              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Redefinir palavra-passe
              </Button>
            </form>
          </>
        ) : null}

        {!isSuccess ? (
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
        ) : null}
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
