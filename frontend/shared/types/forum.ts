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

export interface AdminForumsResponse {
  data: AdminForum[];
}

export interface AdminTopicMutationResponse {
  message: string;
  topic: AdminTopic;
}

export type TopicVisibilityMode = "public" | "private" | "hidden";
