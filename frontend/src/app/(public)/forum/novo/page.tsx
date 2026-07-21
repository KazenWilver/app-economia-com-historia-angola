"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { CreateTopicForm } from "@/components/forum/CreateTopicForm";
import {
  createTopicPayload,
  emptyCreateTopicForm,
  parseApiErrorMessage,
  type CreateTopicFormValues,
  type ForumsResponse,
  type PublicTopic,
  type TopicMutationResponse,
} from "@/components/forum/forum-types";
import { useAuth } from "@/hooks/useAuth";
import {
  API_URL,
  buildAuthHeaders,
  getStoredToken,
  invalidateMemoryCache,
  notifyDataChanged,
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

function resolveCreatedTopic(payload: unknown): PublicTopic | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;
  const topicCandidate = root.topic;

  if (!topicCandidate || typeof topicCandidate !== "object") {
    return null;
  }

  const topic = topicCandidate as Record<string, unknown>;

  // Laravel JsonResource pode envolver em { data: {...} }.
  if (topic.data && typeof topic.data === "object") {
    return topic.data as PublicTopic;
  }

  if (typeof topic.id === "number") {
    return topic as unknown as PublicTopic;
  }

  return null;
}

export default function CreateForumTopicPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [values, setValues] = useState<CreateTopicFormValues>(
    emptyCreateTopicForm(),
  );
  const [forumId, setForumId] = useState<number | null>(null);
  const [isLoadingForum, setIsLoadingForum] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadForum = useCallback(async () => {
    setIsLoadingForum(true);

    try {
      const response = await fetch(`${API_URL}/forums`);
      if (!response.ok) {
        throw new Error("Failed to load forums");
      }

      const data = (await response.json()) as ForumsResponse;
      const firstForumId = data.data[0]?.id ?? null;

      if (firstForumId === null) {
        setErrorMessage("Não existe nenhum fórum disponível.");
      }

      setForumId(firstForumId);
    } catch {
      setForumId(null);
      setErrorMessage("Não foi possível carregar o fórum.");
    } finally {
      setIsLoadingForum(false);
    }
  }, []);

  useEffect(() => {
    void loadForum();
  }, [loadForum]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login?redirect=%2Fforum%2Fnovo");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const handleSubmit = async () => {
    const token = getStoredToken();
    if (!token) {
      setErrorMessage("Sessão expirada. Inicia sessão novamente.");
      return;
    }

    if (forumId === null) {
      setErrorMessage("Não foi possível identificar o fórum. Recarrega a página.");
      return;
    }

    if (!values.title.trim()) {
      setErrorMessage("O título é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}/topics`, {
        method: "POST",
        headers: {
          ...buildAuthHeaders(token),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(createTopicPayload(forumId, values)),
      });

      const rawPayload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        if (rawPayload && typeof rawPayload === "object") {
          const errorBody = rawPayload as {
            message?: string;
            errors?: Record<string, string[]>;
          };
          if (errorBody.message) {
            setErrorMessage(errorBody.message);
            return;
          }
          if (errorBody.errors) {
            setErrorMessage(Object.values(errorBody.errors).flat().join(" "));
            return;
          }
        }

        setErrorMessage(await parseApiErrorMessage(response));
        return;
      }

      const topic =
        resolveCreatedTopic(rawPayload) ??
        (rawPayload as TopicMutationResponse | null)?.topic ??
        null;

      if (!topic?.id) {
        setErrorMessage(
          "O tópico foi criado, mas a resposta da API foi inválida. Abre o fórum para confirmar.",
        );
        invalidateMemoryCache("GET:/topics");
        notifyDataChanged();
        router.replace("/forum");
        return;
      }

      invalidateMemoryCache("GET:/topics");
      notifyDataChanged();
      router.replace(`/forum/${topic.id}`);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Não foi possível criar o tópico.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/forum"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-petrol transition-colors hover:text-petrol/80 dark:text-petrol-dark dark:hover:text-petrol-dark/80"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Voltar ao fórum
      </Link>

      <Card hoverLift={false}>
        <CardHeader>
          <CardTitle>Novo tópico de debate</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingForum ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <CreateTopicForm
              values={values}
              onChange={setValues}
              onSubmit={() => void handleSubmit()}
              isSubmitting={isSubmitting}
              errorMessage={errorMessage}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
