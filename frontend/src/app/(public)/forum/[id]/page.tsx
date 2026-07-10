"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Lock, Trash2 } from "lucide-react";
import { AdminConfirmDeleteModal } from "@/components/admin/AdminConfirmDeleteModal";
import { ReplySection } from "@/components/forum/ReplySection";
import {
  formatForumDate,
  type PublicTopic,
  type PublicTopicResponse,
} from "@/components/forum/forum-types";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, invalidateMemoryCache } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";

export default function ForumTopicDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const topicId = Number(params.id);
  const { user, isAuthenticated } = useAuth();
  const [topic, setTopic] = useState<PublicTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const loadTopic = useCallback(async () => {
    if (!Number.isFinite(topicId)) {
      setErrorMessage("Tópico inválido.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<PublicTopicResponse>(`/topics/${topicId}`, {
        skipCache: true,
      });
      setTopic(data.data);
    } catch {
      setTopic(null);
      setErrorMessage("Tópico não encontrado ou sem permissão para o ver.");
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    void loadTopic();
  }, [loadTopic]);

  const canManageTopic =
    isAuthenticated &&
    topic !== null &&
    (user?.id === topic.author?.id || user?.role === "admin");

  const handleDeleteTopic = async () => {
    if (!topic) {
      return;
    }

    setIsDeleting(true);

    try {
      await apiFetch<{ message: string }>(`/topics/${topic.id}`, {
        method: "DELETE",
      });
      invalidateMemoryCache("GET:/topics");
      setIsConfirmOpen(false);
      router.replace("/forum");
      router.refresh();
    } catch {
      setErrorMessage("Não foi possível eliminar o tópico.");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="mb-6 h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/forum"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-petrol transition-colors hover:text-petrol/80 dark:text-petrol-dark"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Voltar ao fórum
        </Link>
        <Toast variant="error" message={errorMessage ?? "Tópico não encontrado."} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/forum"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-petrol transition-colors hover:text-petrol/80 dark:text-petrol-dark dark:hover:text-petrol-dark/80"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Voltar ao fórum
      </Link>

      {errorMessage ? (
        <div className="mb-6">
          <Toast
            variant="error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        </div>
      ) : null}

      <Card hoverLift={false} className="mb-8">
        <CardContent className="space-y-5 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {topic.is_private ? (
              <Badge type="forum" className="inline-flex items-center gap-1">
                <Lock className="h-3 w-3" strokeWidth={1.5} />
                Privado
              </Badge>
            ) : (
              <Badge type="forum">Público</Badge>
            )}
            {topic.theme ? <Badge type="default">{topic.theme}</Badge> : null}
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary">
              {topic.title}
            </h1>
            {topic.description ? (
              <p className="whitespace-pre-wrap text-content-secondary dark:text-content-dark-secondary">
                {topic.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-content-tertiary dark:border-border-dark dark:text-content-dark-tertiary">
            <span>
              Por {topic.author?.name ?? "Comunidade Jindungo"}
              {topic.forum ? ` · ${topic.forum.name}` : ""}
            </span>
            <time dateTime={topic.created_at}>
              {formatForumDate(topic.created_at)}
            </time>
          </div>

          {canManageTopic ? (
            <div className="flex justify-end border-t border-border pt-4 dark:border-border-dark">
              <Button
                type="button"
                variant="ghost"
                className="text-error-light dark:text-error-dark"
                onClick={() => setIsConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                Eliminar tópico
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ReplySection topicId={topic.id} />

      <AdminConfirmDeleteModal
        isOpen={isConfirmOpen}
        title="Eliminar tópico"
        message="Tens a certeza de que queres eliminar este tópico? As respostas também serão removidas."
        itemLabel={topic.title}
        itemDetail={topic.theme ?? undefined}
        isLoading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setIsConfirmOpen(false);
          }
        }}
        onConfirm={() => void handleDeleteTopic()}
      />
    </div>
  );
}
