"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { TutorAskResponse, TutorExchange } from "@shared/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  exchange?: TutorExchange;
}

const SUGGESTIONS = [
  "O que é a diversificação económica em Angola?",
  "Qual o peso do petróleo nas exportações?",
  "Que papel teve o café na economia angolana?",
];

export function TutorChat() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login?redirect=%2Ftutor");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, isAsking]);

  const ask = async (rawQuestion: string) => {
    const trimmed = rawQuestion.trim();
    if (trimmed.length < 5 || isAsking) {
      return;
    }

    setErrorMessage(null);
    setIsAsking(true);
    setQuestion("");
    setTurns((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: "user", text: trimmed },
    ]);

    try {
      const response = await apiFetch<TutorAskResponse>("/tutor/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
        skipCache: true,
      });

      setTurns((current) => [
        ...current,
        {
          id: `a-${response.data.id}`,
          role: "assistant",
          text: response.data.answer,
          exchange: response.data,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível obter resposta do tutor.";
      setErrorMessage(message);
      setTurns((current) => [
        ...current,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          text: "Desculpa — não consegui responder agora. Tenta novamente dentro de momentos.",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(question);
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardContent className="py-10 text-center text-sm text-content-secondary dark:text-content-dark-secondary">
            A preparar o tutor…
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-2">
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-bordeaux dark:text-bordeaux-dark">
          Assistente educativo
        </p>
        <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
          Tutor
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-content-secondary dark:text-content-dark-secondary sm:text-base">
          Faz perguntas sobre economia e história de Angola. As respostas
          baseiam-se nos conteúdos publicados da biblioteca — não são chat
          genérico.
        </p>
      </header>

      {errorMessage ? (
        <Toast
          variant="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      ) : null}

      <Card className="overflow-hidden p-0">
        <CardHeader className="border-b border-border px-5 py-4 dark:border-border-dark">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-bordeaux dark:text-bordeaux-dark" strokeWidth={1.5} />
            Conversação
          </CardTitle>
        </CardHeader>

        <CardContent className="flex max-h-[min(60vh,520px)] flex-col gap-4 overflow-y-auto px-5 py-5">
          {turns.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
                Sugestões para começar:
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    disabled={isAsking}
                    onClick={() => void ask(suggestion)}
                    className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-left text-sm text-content-primary transition-colors hover:border-bordeaux/40 hover:bg-bordeaux/5 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary dark:hover:border-bordeaux-dark/40 dark:hover:bg-bordeaux-dark/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {turns.map((turn) => (
            <div
              key={turn.id}
              className={
                turn.role === "user"
                  ? "ml-8 rounded-2xl bg-bordeaux px-4 py-3 text-sm text-white dark:bg-bordeaux-dark"
                  : "mr-4 space-y-3 rounded-2xl border border-border bg-surface-secondary px-4 py-3 text-sm text-content-primary dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
              }
            >
              <p className="whitespace-pre-wrap leading-relaxed">{turn.text}</p>

              {turn.exchange?.sources && turn.exchange.sources.length > 0 ? (
                <div className="space-y-2 border-t border-border/60 pt-3 dark:border-border-dark/60">
                  <p className="font-display text-xs font-semibold uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                    Fontes na biblioteca
                  </p>
                  <ul className="space-y-2">
                    {turn.exchange.sources.map((source) => (
                      <li key={source.id}>
                        <Link
                          href={`/explorar/${source.slug}`}
                          className="group flex items-start gap-2 rounded-lg text-petrol hover:text-bordeaux dark:text-petrol-dark dark:hover:text-bordeaux-dark"
                        >
                          <BookOpen
                            className="mt-0.5 h-4 w-4 shrink-0"
                            strokeWidth={1.5}
                          />
                          <span>
                            <span className="font-medium underline-offset-2 group-hover:underline">
                              {source.title}
                            </span>
                            {source.excerpt ? (
                              <span className="mt-0.5 block text-xs text-content-secondary dark:text-content-dark-secondary">
                                {source.excerpt}
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ))}

          {isAsking ? (
            <p className="text-sm text-content-tertiary dark:text-content-dark-tertiary">
              A consultar a biblioteca…
            </p>
          ) : null}
          <div ref={bottomRef} />
        </CardContent>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-t border-border px-5 py-4 dark:border-border-dark sm:flex-row sm:items-end"
        >
          <label className="sr-only" htmlFor="tutor-question">
            A tua pergunta
          </label>
          <textarea
            id="tutor-question"
            rows={2}
            value={question}
            disabled={isAsking}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Pergunta sobre um tema da biblioteca…"
            className="min-h-11 w-full flex-1 resize-y rounded-xl border border-border bg-surface-card px-3.5 py-2.5 text-sm text-content-primary placeholder:text-content-tertiary focus:border-bordeaux focus:outline-none focus:ring-2 focus:ring-bordeaux/15 dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary dark:placeholder:text-content-dark-tertiary dark:focus:border-bordeaux-dark dark:focus:ring-bordeaux-dark/20"
          />
          <Button type="submit" isLoading={isAsking} disabled={question.trim().length < 5}>
            <Send className="h-4 w-4" strokeWidth={1.5} />
            Perguntar
          </Button>
        </form>
      </Card>
    </div>
  );
}
