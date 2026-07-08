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

export interface ContentItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  body?: string | null;
  type: ContentType;
  media_url: string | null;
  is_exclusive: boolean | null;
  published_at: string | null;
  category: Category | null;
}

export function getContentPreview(content: ContentItem): string {
  if (content.excerpt) {
    return content.excerpt;
  }

  if (content.body) {
    return content.body.length > 160
      ? `${content.body.slice(0, 160).trimEnd()}…`
      : content.body;
  }

  return "Sem descrição disponível.";
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

export { API_URL, buildAuthHeaders, getStoredToken } from "@/lib/api";
import { API_URL } from "@/lib/api";

export function resolveMediaUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const base = API_URL.replace(/\/api$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

const IMAGE_MEDIA_PATTERN = /\.(jpe?g|png|webp|gif)$/i;

export function isImageMediaUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }

  const path = url.split("?")[0]?.split("#")[0] ?? "";

  return IMAGE_MEDIA_PATTERN.test(path);
}
