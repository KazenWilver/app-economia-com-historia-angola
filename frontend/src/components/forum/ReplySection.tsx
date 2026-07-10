"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Reply, Trash2 } from "lucide-react";
import { AdminConfirmDeleteModal } from "@/components/admin/AdminConfirmDeleteModal";
import type { ForumReply } from "@/components/forum/forum-types";
import {
  formatForumDate,
  parseApiErrorMessage,
  type RepliesResponse,
} from "@/components/forum/forum-types";
import { useAuth } from "@/hooks/useAuth";
import { API_URL, buildAuthHeaders, getStoredToken } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

function removeReplyFromTree(
  replies: ForumReply[],
  replyId: number,
): ForumReply[] {
  return replies
    .filter((reply) => reply.id !== replyId)
    .map((reply) => ({
      ...reply,
      replies: removeReplyFromTree(reply.replies ?? [], replyId),
    }));
}

interface ReplyFormProps {
  placeholder: string;
  submitLabel: string;
  onSubmit: (body: string) => Promise<void>;
  onCancel?: () => void;
}

function ReplyForm({
  placeholder,
  submitLabel,
  onSubmit,
  onCancel,
}: ReplyFormProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = body.trim();
    if (!trimmed) {
      setError("Escreve uma resposta antes de publicar.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(trimmed);
      setBody("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível publicar a resposta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="min-h-24 w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-content-primary transition-colors duration-200 placeholder:text-content-tertiary focus:border-petrol focus:outline-none focus:ring-2 focus:ring-petrol/20 dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary dark:placeholder:text-content-dark-tertiary dark:focus:border-petrol-dark dark:focus:ring-petrol-dark/20"
      />
      {error ? (
        <p className="text-xs text-error-light dark:text-error-dark" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
      </div>
    </form>
  );
}

interface ReplyThreadProps {
  reply: ForumReply;
  currentUserId: number | null;
  depth?: number;
  onReply: (parentId: number, body: string) => Promise<void>;
  onDelete: (replyId: number) => Promise<void>;
}

function ReplyThread({
  reply,
  currentUserId,
  depth = 0,
  onReply,
  onDelete,
}: ReplyThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const canDelete = currentUserId !== null && reply.user.id === currentUserId;
  const nestedReplies = reply.replies ?? [];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(reply.id);
      setIsConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={cn(
        depth > 0 &&
          "ml-4 border-l-2 border-petrol/50 pl-4 dark:border-petrol-dark/50 sm:ml-6",
      )}
    >
      <article className="rounded-xl border border-border bg-surface-card p-4 dark:border-border-dark dark:bg-surface-dark-card">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary">
            {reply.user.name}
          </p>
          <time
            dateTime={reply.created_at}
            className="text-xs text-content-tertiary dark:text-content-dark-tertiary"
          >
            {formatForumDate(reply.created_at)}
          </time>
        </div>

        <p className="whitespace-pre-wrap text-sm text-content-secondary dark:text-content-dark-secondary">
          {reply.body}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {currentUserId !== null ? (
            <Button
              type="button"
              variant="ghost"
              className="min-h-9 px-3 py-1.5"
              onClick={() => setIsReplying((value) => !value)}
            >
              <Reply className="h-4 w-4" strokeWidth={1.5} />
              Responder
            </Button>
          ) : null}

          {canDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="min-h-9 px-3 py-1.5 text-error-light dark:text-error-dark"
              onClick={() => setIsConfirmOpen(true)}
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
              Eliminar
            </Button>
          ) : null}
        </div>

        {isReplying ? (
          <div className="mt-4 border-t border-border pt-4 dark:border-border-dark">
            <ReplyForm
              placeholder="Continua o debate..."
              submitLabel="Publicar resposta"
              onCancel={() => setIsReplying(false)}
              onSubmit={async (body) => {
                await onReply(reply.id, body);
                setIsReplying(false);
              }}
            />
          </div>
        ) : null}
      </article>

      <AdminConfirmDeleteModal
        isOpen={isConfirmOpen}
        title="Eliminar resposta"
        message="Tens a certeza de que queres eliminar esta resposta?"
        itemLabel={reply.user.name}
        itemDetail={reply.body.slice(0, 120)}
        isLoading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setIsConfirmOpen(false);
          }
        }}
        onConfirm={() => void handleDelete()}
      />

      {nestedReplies.length > 0 ? (
        <div className="mt-4 space-y-4">
          {nestedReplies.map((nestedReply) => (
            <ReplyThread
              key={nestedReply.id}
              reply={nestedReply}
              currentUserId={currentUserId}
              depth={depth + 1}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export interface ReplySectionProps {
  topicId: number;
}

export function ReplySection({ topicId }: ReplySectionProps) {
  const { user, token, isAuthenticated } = useAuth();
  const authToken = token ?? getStoredToken();
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchReplies = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const response = await fetch(`${API_URL}/topics/${topicId}/replies`, {
          headers: buildAuthHeaders(authToken),
        });

        if (!response.ok) {
          throw new Error("Failed to load replies");
        }

        const data = (await response.json()) as RepliesResponse;
        setReplies(data.data);
      } catch {
        if (!options?.silent) {
          setErrorMessage("Não foi possível carregar as respostas.");
        }
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [authToken, topicId],
  );

  useEffect(() => {
    void fetchReplies();
  }, [fetchReplies]);

  const createReply = async (body: string, parentId?: number) => {
    const activeToken = authToken;
    if (!activeToken) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/topics/${topicId}/replies`, {
      method: "POST",
      headers: {
        ...buildAuthHeaders(activeToken),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body,
        ...(parentId ? { parent_id: parentId } : {}),
      }),
    });

    if (!response.ok) {
      throw new Error(await parseApiErrorMessage(response));
    }

    await fetchReplies({ silent: true });
    setSuccessMessage(
      parentId ? "Resposta publicada com sucesso." : "Resposta publicada com sucesso.",
    );
  };

  const deleteReply = async (replyId: number) => {
    const activeToken = authToken;
    if (!activeToken) {
      return;
    }

    setReplies((current) => removeReplyFromTree(current, replyId));

    const response = await fetch(
      `${API_URL}/topics/${topicId}/replies/${replyId}`,
      {
        method: "DELETE",
        headers: buildAuthHeaders(activeToken),
      },
    );

    if (!response.ok) {
      await fetchReplies({ silent: true });
      throw new Error("Failed to delete reply");
    }

    setSuccessMessage("Resposta eliminada com sucesso.");
  };

  return (
    <Card hoverLift={false}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare
            className="h-5 w-5 text-petrol dark:text-petrol-dark"
            strokeWidth={1.5}
            aria-hidden
          />
          <CardTitle>Respostas</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {successMessage ? (
          <Toast
            variant="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        ) : null}

        {errorMessage ? (
          <Toast
            variant="error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        ) : null}

        {isAuthenticated ? (
          <ReplyForm
            placeholder="Partilha a tua perspectiva neste debate..."
            submitLabel="Publicar resposta"
            onSubmit={(body) => createReply(body)}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border p-4 text-center dark:border-border-dark">
            <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
              <Link
                href={`/login?redirect=${encodeURIComponent(`/forum/${topicId}`)}`}
                className="font-semibold text-petrol hover:underline dark:text-petrol-dark"
              >
                Inicia sessão
              </Link>{" "}
              para responder ao debate.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : replies.length === 0 ? (
          <p className="text-center text-sm text-content-tertiary dark:text-content-dark-tertiary">
            Ainda não há respostas. Sê o primeiro a participar neste debate.
          </p>
        ) : (
          <div className="space-y-4">
            {replies.map((reply) => (
              <ReplyThread
                key={reply.id}
                reply={reply}
                currentUserId={user?.id ?? null}
                onReply={(parentId, body) => createReply(body, parentId)}
                onDelete={deleteReply}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
