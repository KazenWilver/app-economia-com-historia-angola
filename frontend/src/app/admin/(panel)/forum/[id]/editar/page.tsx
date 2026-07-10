"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TopicForm } from "@/components/admin/TopicForm";
import {
  emptyTopicForm,
  formValuesToTopicPayload,
  topicToFormValues,
  type AdminTopic,
  type AdminTopicResponse,
  type ForumsResponse,
  type TopicFormValues,
  type TopicMutationResponse,
} from "@/components/admin/forum-types";
import type { AdminForum } from "@/components/admin/forum-types";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminFetch } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";

export default function AdminEditTopicPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const topicId = params.id;
  const { token } = useAdminAuth();

  const [forums, setForums] = useState<AdminForum[]>([]);
  const [topic, setTopic] = useState<AdminTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialValues = useMemo(
    () => (topic ? topicToFormValues(topic) : emptyTopicForm()),
    [topic],
  );

  const loadData = useCallback(async () => {
    if (!token || !topicId) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [forumsData, topicData] = await Promise.all([
        adminFetch<ForumsResponse>("/forums", { token }),
        adminFetch<AdminTopicResponse>(`/admin/topics/${topicId}`, { token }),
      ]);
      setForums(forumsData.data);
      setTopic(topicData.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível carregar o tópico.",
      );
      setTopic(null);
    } finally {
      setIsLoading(false);
    }
  }, [topicId, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSubmit = async (values: TopicFormValues) => {
    if (!token || !topicId) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await adminFetch<TopicMutationResponse>(`/topics/${topicId}`, {
        method: "PUT",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValuesToTopicPayload(values)),
      });
      setTopic(data.topic);
      setSuccessMessage("Tópico actualizado com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível actualizar.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!topic) {
    return (
      <Card hoverLift={false}>
        <CardContent className="py-10 text-center">
          {errorMessage ?? "Tópico não encontrado."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Editar tópico</h1>
        <p className="mt-2 text-content-secondary dark:text-content-dark-secondary">
          {topic.title}
        </p>
      </header>

      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </p>
      ) : null}

      <Card hoverLift={false}>
        <CardHeader>
          <CardTitle>Dados do tópico</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicForm
            key={`${topic.id}-${topic.updated_at}`}
            initialValues={initialValues}
            forums={forums}
            submitLabel="Guardar alterações"
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/forum")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
