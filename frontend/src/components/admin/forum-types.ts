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
  is_private: boolean;
  is_visible: boolean;
}

export function emptyTopicForm(): TopicFormValues {
  return {
    forum_id: "",
    title: "",
    description: "",
    theme: "",
    is_private: false,
    is_visible: true,
  };
}

export function topicToFormValues(topic: AdminTopic): TopicFormValues {
  return {
    forum_id: String(topic.forum_id),
    title: topic.title,
    description: topic.description ?? "",
    theme: topic.theme ?? "",
    is_private: topic.is_private,
    is_visible: topic.is_visible,
  };
}

export function formValuesToTopicPayload(values: TopicFormValues) {
  return {
    forum_id: Number(values.forum_id),
    title: values.title.trim(),
    description: values.description.trim() || null,
    theme: values.theme.trim() || null,
    is_private: values.is_private,
    is_visible: values.is_visible,
  };
}
