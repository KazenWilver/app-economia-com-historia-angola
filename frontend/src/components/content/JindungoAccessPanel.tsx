"use client";

import { useCallback, useState } from "react";
import { Clock3, ShieldCheck, ShieldX, Sparkles } from "lucide-react";
import type {
  JindungoAccessMutationResponse,
  JindungoAccessStatus,
  JindungoAccessStatusResponse,
} from "@shared/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { apiFetch } from "@/lib/api";

interface JindungoAccessPanelProps {
  token: string;
  onAccessChange?: (hasAccess: boolean) => void;
}

const STATUS_COPY: Record<
  Exclude<JindungoAccessStatus, "approved">,
  { title: string; body: string }
> = {
  none: {
    title: "Acesso sujeito a aprovação",
    body: "Os textos Jindungo são exclusivos. Envia um pedido ao administrador; só depois de aprovado poderás abrir e ler os conteúdos.",
  },
  pending: {
    title: "Pedido em análise",
    body: "O teu pedido já foi enviado. Assim que o administrador decidir, o acesso à biblioteca Jindungo fica disponível aqui.",
  },
  rejected: {
    title: "Pedido rejeitado",
    body: "O administrador não aprovou o acesso desta vez. Podes voltar a enviar um novo pedido com uma justificação.",
  },
};

export function JindungoAccessPanel({
  token,
  onAccessChange,
}: JindungoAccessPanelProps) {
  const [status, setStatus] = useState<JindungoAccessStatus | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const loadStatus = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const data = await apiFetch<JindungoAccessStatusResponse>(
          "/jindungo/access",
          { token, skipCache: true },
        );
        setStatus(data.data.status);
        onAccessChange?.(data.data.has_access);
      } catch {
        setErrorMessage(
          "Não foi possível verificar o estado do acesso Jindungo.",
        );
        setStatus("none");
        onAccessChange?.(false);
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [onAccessChange, token],
  );

  useLiveRefresh(loadStatus);

  const submitRequest = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<JindungoAccessMutationResponse>(
        "/jindungo/access-requests",
        {
          method: "POST",
          token,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message.trim() || undefined,
          }),
          skipCache: true,
        },
      );
      setStatus(data.data.status);
      setInfoMessage(data.message);
      setMessage("");
      onAccessChange?.(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o pedido.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || status === null) {
    return (
      <Card hoverLift={false} className="border-gold/20">
        <CardContent className="py-8 text-center text-sm text-content-secondary dark:text-content-dark-secondary">
          A verificar o teu acesso…
        </CardContent>
      </Card>
    );
  }

  if (status === "approved") {
    return null;
  }

  const copy = STATUS_COPY[status];
  const Icon =
    status === "pending" ? Clock3 : status === "rejected" ? ShieldX : ShieldCheck;

  return (
    <Card hoverLift={false} className="border-gold/30 bg-gold/5 dark:border-gold-dark/30 dark:bg-gold-dark/5">
      <CardContent className="space-y-4 py-8">
        {errorMessage ? (
          <Toast
            variant="error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        ) : null}
        {infoMessage ? (
          <Toast
            variant="info"
            message={infoMessage}
            onClose={() => setInfoMessage(null)}
          />
        ) : null}

        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold dark:bg-gold-dark/20 dark:text-gold-dark">
            <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="space-y-2">
            <p className="font-display text-xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
              {copy.title}
            </p>
            <p className="mx-auto max-w-xl text-sm text-content-secondary dark:text-content-dark-secondary">
              {copy.body}
            </p>
          </div>
        </div>

        {status === "none" || status === "rejected" ? (
          <div className="mx-auto max-w-lg space-y-3">
            <label
              htmlFor="jindungo-access-message"
              className="block font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary"
            >
              Mensagem (opcional)
            </label>
            <textarea
              id="jindungo-access-message"
              rows={3}
              value={message}
              disabled={isSubmitting}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Explica brevemente porque queres aceder aos textos Jindungo…"
              className="min-h-11 w-full resize-y rounded-xl border border-border bg-surface-card px-3.5 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-bordeaux focus:outline-none focus:ring-2 focus:ring-bordeaux/15 dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary dark:placeholder:text-content-dark-tertiary dark:focus:border-bordeaux-dark dark:focus:ring-bordeaux-dark/20"
            />
            <Button
              type="button"
              isLoading={isSubmitting}
              onClick={() => void submitRequest()}
              className="w-full sm:w-auto"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              Pedir acesso
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
