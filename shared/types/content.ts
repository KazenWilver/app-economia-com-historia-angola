export type ContentType = "texto" | "audio" | "video" | "podcast" | "jindungo";

export type ContentStatus = "draft" | "published" | "archived";

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Author {
  id: number;
  name: string;
  email: string;
}

/** Resumo de conteúdo usado em listagens e recomendações. */
export interface ContentSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  type: ContentType;
  media_url: string | null;
  is_exclusive: boolean | null;
  published_at: string | null;
  category: Category | null;
}

export interface ContentItem extends ContentSummary {
  body?: string | null;
}

export interface ContentDetail {
  id: number;
  title: string;
  slug: string;
  body: string | null;
  type: ContentType;
  media_url: string | null;
  statistics_data: string | null;
  is_exclusive: boolean | null;
  published_at: string | null;
  category: Category | null;
  author: Author | null;
}

export interface ContentsResponse {
  data: ContentItem[];
}

export interface ContentDetailResponse {
  data: ContentDetail;
}

export interface CommentUser {
  id: number;
  name: string;
  email: string;
}

export interface CommentItem {
  id: number;
  body: string;
  parent_id: number | null;
  user: CommentUser;
  replies: CommentItem[];
  created_at: string;
}

export interface CommentsResponse {
  data: CommentItem[];
}
