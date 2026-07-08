"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { TopicForm } from "@/components/admin/TopicForm";
import {
  emptyTopicForm,
  formValuesToTopicPayload,
  type ForumsResponse,
  type TopicFormValues,
  type TopicMutationResponse,
} from "@/components/admin/forum-types";
import type { AdminForum } from "@/components/admin/forum-types";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminFetch } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function AdminCreateTopicPage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [forums, setForums] = useState<AdminForum[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadForums = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminFetch<ForumsResponse>("/forums", { token });
      setForums(data.data);
    } catch {
      setErrorMessage("Não foi possível carregar os fóruns.");
    }
  }, [token]);

  useEffect(() => {
    void loadForums();
  }, [loadForums]);

  const handleSubmit = async (values: TopicFormValues) => {
    if (!token) {
      setErrorMessage("Sessão de administrador inválida.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await adminFetch<TopicMutationResponse>("/topics", {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValuesToTopicPayload(values)),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível criar o tópico.",
      );
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/forum?created=1");
  };

  const initialValues = {
    ...emptyTopicForm(),
    forum_id: forums[0] ? String(forums[0].id) : "",
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-content-dark-primary">
          Novo tópico
        </h1>
      </header>

      <Card hoverLift={false}>
        <CardHeader>
          <CardTitle>Dados do tópico</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicForm
            key={forums.length}
            initialValues={initialValues}
            forums={forums}
            submitLabel="Criar tópico"
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
