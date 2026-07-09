"use client";

import Link from "next/link";
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
import { requestPasswordReset } from "@/lib/auth-password";
import { cn } from "@/lib/utils";

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
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [devResetLink, setDevResetLink] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setSuccessMessage(undefined);
    setDevResetLink(undefined);

    if (!email.trim()) {
      setError("O email é obrigatório.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("O email deve ser válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset(email.trim(), redirectAfterReset);
      setSuccessMessage(response.message);
      setDevResetLink(response.dev_reset_link);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível enviar o pedido de recuperação.",
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
          Indica o teu email e enviaremos instruções para redefinires a palavra-passe.
        </p>
      </CardHeader>

      <CardContent className={isAdmin ? "text-slate-300" : undefined}>
        {error ? (
          <Toast variant="error" title="Erro" message={error} className="mb-4" />
        ) : null}

        {successMessage ? (
          <Toast
            variant="success"
            title="Pedido enviado"
            message={successMessage}
            className="mb-4"
          />
        ) : null}

        {devResetLink ? (
          <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <p className="font-semibold text-amber-700 dark:text-amber-300">
              Modo desenvolvimento
            </p>
            <p className="mt-1 break-all text-content-secondary dark:text-content-dark-secondary">
              <Link href={devResetLink} className="font-medium text-bordeaux hover:underline dark:text-bordeaux-dark">
                Abrir link de redefinição
              </Link>
            </p>
          </div>
        ) : null}

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
            Enviar instruções
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
