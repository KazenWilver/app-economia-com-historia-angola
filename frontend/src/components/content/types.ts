export type ContentType = "texto" | "audio" | "video" | "podcast" | "jindungo";

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

export interface ContentDetail {
  id: number;
  title: string;
  slug: string;
  body: string | null;
  type: ContentType;
  media_url: string | null;
  is_exclusive: boolean | null;
  published_at: string | null;
  category: Category | null;
  author: Author | null;
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

export interface ContentDetailResponse {
  data: ContentDetail;
}

export interface CommentsResponse {
  data: CommentItem[];
}

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export function resolveMediaUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const base = API_URL.replace(/\/api$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}
