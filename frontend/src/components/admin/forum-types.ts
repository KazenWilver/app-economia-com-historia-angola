export interface AdminForum {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  topics_count?: number;
}

export interface AdminTopic {
  id: number;
  forum_id: number;
  user_id: number;
  title: string;
  description: string | null;
  theme: string | null;
  is_private: boolean;
  is_visible: boolean;
  replies_count?: number;
  forum?: AdminForum;
  author?: { id: number; name: string; email: string };
  created_at: string;
  updated_at: string;
}

export interface AdminTopicsResponse {
  data: AdminTopic[];
}

export interface AdminTopicResponse {
  data: AdminTopic;
}

export interface ForumsResponse {
  data: AdminForum[];
}

export interface TopicMutationResponse {
  message: string;
  topic: AdminTopic;
}

export interface TopicFormValues {
  forum_id: string;
  title: string;
  description: string;
  theme: string;
  visibility: TopicVisibilityMode;
}

export type TopicVisibilityMode = "public" | "private" | "hidden";

export function visibilityToFlags(mode: TopicVisibilityMode): {
  is_visible: boolean;
  is_private: boolean;
} {
  switch (mode) {
    case "private":
      return { is_visible: false, is_private: true };
    case "hidden":
      return { is_visible: false, is_private: false };
    default:
      return { is_visible: true, is_private: false };
  }
}

export function flagsToVisibility(
  is_visible: boolean,
  is_private: boolean,
): TopicVisibilityMode {
  if (is_private) {
    return "private";
  }

  if (is_visible) {
    return "public";
  }

  return "hidden";
}

export function emptyTopicForm(): TopicFormValues {
  return {
    forum_id: "",
    title: "",
    description: "",
    theme: "",
    visibility: "public",
  };
}

export function topicToFormValues(topic: AdminTopic): TopicFormValues {
  return {
    forum_id: String(topic.forum_id),
    title: topic.title,
    description: topic.description ?? "",
    theme: topic.theme ?? "",
    visibility: flagsToVisibility(topic.is_visible, topic.is_private),
  };
}

export function formValuesToTopicPayload(values: TopicFormValues) {
  const visibility = visibilityToFlags(values.visibility);

  return {
    forum_id: Number(values.forum_id),
    title: values.title.trim(),
    description: values.description.trim() || null,
    theme: values.theme.trim() || null,
    is_private: visibility.is_private,
    is_visible: visibility.is_visible,
  };
}
