export interface ForumAuthor {
  id: number;
  name: string;
}

export interface ForumSummary {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface PublicTopic {
  id: number;
  forum_id: number;
  title: string;
  description: string | null;
  theme: string | null;
  is_private: boolean;
  is_visible: boolean;
  replies_count?: number;
  forum?: ForumSummary;
  author?: ForumAuthor;
  created_at: string;
  updated_at: string;
}

export interface PublicTopicsResponse {
  data: PublicTopic[];
}

export interface PublicTopicResponse {
  data: PublicTopic;
}

export interface ForumsResponse {
  data: ForumSummary[];
}

export interface TopicMutationResponse {
  message: string;
  topic: PublicTopic;
}

export interface ForumReply {
  id: number;
  topic_id: number;
  body: string;
  parent_id: number | null;
  user: ForumAuthor;
  replies: ForumReply[];
  created_at: string;
  updated_at: string;
}

export interface RepliesResponse {
  data: ForumReply[];
}

export type PublicTopicVisibility = "public" | "private";

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
  return {
    forum_id: forumId,
    title: values.title.trim(),
    description: values.description.trim() || null,
    theme: values.theme.trim() || null,
    is_private: values.visibility === "private",
    is_visible: true,
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
