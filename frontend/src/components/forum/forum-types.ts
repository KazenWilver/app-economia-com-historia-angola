export type {
  ForumAuthor,
  ForumReply,
  ForumSummary,
  ForumsResponse,
  PublicTopic,
  PublicTopicResponse,
  PublicTopicVisibility,
  PublicTopicsResponse,
  RepliesResponse,
  TopicMutationResponse,
} from "@shared/types";

import type { PublicTopicVisibility } from "@shared/types";

export interface CreateTopicFormValues {
  title: string;
  description: string;
  theme: string;
  visibility: PublicTopicVisibility;
}

export function emptyCreateTopicForm(): CreateTopicFormValues {
  return {
    title: "",
    description: "",
    theme: "",
    visibility: "public",
  };
}

export function createTopicPayload(
  forumId: number,
  values: CreateTopicFormValues,
) {
  const isPrivate = values.visibility === "private";

  return {
    forum_id: forumId,
    title: values.title.trim(),
    description: values.description.trim() || null,
    theme: values.theme.trim() || null,
    // Privado = só autor/admin; não pode ser is_visible + is_private ao mesmo tempo.
    is_private: isPrivate,
    is_visible: !isPrivate,
  };
}

export async function parseApiErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      message?: string;
      errors?: Record<string, string[]>;
    };

    if (data.message) {
      return data.message;
    }

    if (data.errors) {
      return Object.values(data.errors).flat().join(" ");
    }
  } catch {
    // Ignorar corpo inválido.
  }

  return "Não foi possível concluir o pedido.";
}

export function formatForumDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
