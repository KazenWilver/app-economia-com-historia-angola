"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { extractResetLink, requestPasswordReset } from "@/lib/auth-password";
import { cn } from "@/lib/utils";

const SAFE_SUCCESS_MESSAGE =
  "Pedido registado. Se o email existir na plataforma, podes recuperar a palavra-passe.";

export interface ForgotPasswordFormProps {
  loginHref: string;
  redirectAfterReset: string;
  variant?: "public" | "admin";
}

export function ForgotPasswordForm({
  loginHref,
  redirectAfterReset,
  variant = "public",
}: ForgotPasswordFormProps) {
  const isAdmin = variant === "admin";
  const isSubmittingRef = useRef(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [resetLink, setResetLink] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmittingRef.current) {
      return;
    }

    setError(undefined);
    setSuccessMessage(undefined);
    setResetLink(undefined);

    if (!email.trim()) {
      setError("O email é obrigatório.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("O email deve ser válido.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email.trim(), redirectAfterReset);
      const link = extractResetLink(response);

      setResetLink(link);
      setSuccessMessage(
        link
          ? "Pedido registado. Clica no botão abaixo para redefinires a tua palavra-passe."
          : response.message,
      );
      setIsSubmitted(true);
    } catch {
      setSuccessMessage(SAFE_SUCCESS_MESSAGE);
      setIsSubmitted(true);
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
          Recuperar palavra-passe
        </CardTitle>
        <p
          className={cn(
            "text-sm",
            isAdmin
              ? "text-slate-300"
              : "text-content-secondary dark:text-content-dark-secondary",
          )}
        >
          Introduz o teu email para gerares o link de recuperação.
        </p>
      </CardHeader>

      <CardContent className={isAdmin ? "text-slate-300" : undefined}>
        {error ? (
          <Toast variant="error" title="Erro" message={error} className="mb-4" />
        ) : null}

        {isSubmitted && successMessage ? (
          <div className="mb-4 space-y-4">
            <Toast
              variant="success"
              title="Pedido registado"
              message={successMessage}
            />

            {resetLink ? (
              <div
                className={cn(
                  "rounded-xl border p-4",
                  isAdmin
                    ? "border-bordeaux-dark/40 bg-slate-950"
                    : "border-bordeaux/20 bg-surface-secondary dark:border-bordeaux-dark/30 dark:bg-surface-dark-secondary",
                )}
              >
                <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
                  Não usamos envio de email nesta versão. O link de recuperação
                  fica disponível aqui:
                </p>
                <Link
                  href={resetLink}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-bordeaux px-4 py-2.5 font-display text-sm font-semibold text-white transition-all duration-200 hover:bg-bordeaux/90 dark:bg-bordeaux-dark dark:hover:bg-bordeaux-dark/90"
                >
                  Redefinir palavra-passe
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        {!isSubmitted ? (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              placeholder={isAdmin ? "admin@jindungo.ao" : "utilizador@jindungo.ao"}
              labelClassName={isAdmin ? "text-[#F8FAFC]" : undefined}
              className={
                isAdmin
                  ? "border-slate-600 bg-slate-950 text-[#F8FAFC] placeholder:text-slate-500 focus:border-bordeaux-dark focus:ring-bordeaux-dark/30"
                  : undefined
              }
              onChange={(event) => setEmail(event.target.value)}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Gerar link de recuperação
            </Button>
          </form>
        ) : null}

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
