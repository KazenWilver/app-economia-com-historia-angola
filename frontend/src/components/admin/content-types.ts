export type { ContentStatus, ContentType } from "@shared/types";
export type { Author as AdminAuthor, Category as AdminCategory } from "@shared/types";

import type { Author, Category, ContentStatus, ContentType } from "@shared/types";

export interface AdminContent {
  id: number;
  title: string;
  slug: string;
  body: string | null;
  type: ContentType;
  media_url: string | null;
  statistics_data: string | null;
  is_exclusive: boolean;
  status: ContentStatus;
  view_count: number;
  published_at: string | null;
  category: Category | null;
  author: Author | null;
  created_at: string;
  updated_at: string;
}

export interface AdminContentsResponse {
  data: AdminContent[];
}

export interface AdminContentResponse {
  data?: AdminContent;
  content?: AdminContent;
  message?: string;
}

export interface AdminCategoriesResponse {
  data: Category[];
}

export interface ContentFormValues {
  category_id: string;
  title: string;
  slug: string;
  body: string;
  type: ContentType;
  media_url: string;
  statistics_data: string;
  is_exclusive: boolean;
  status: ContentStatus;
}

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string }[] = [
  { value: "texto", label: "Texto" },
  { value: "audio", label: "Áudio" },
  { value: "video", label: "Vídeo" },
  { value: "podcast", label: "Podcast" },
  { value: "jindungo", label: "Jindungo" },
];

export const CONTENT_STATUS_OPTIONS: {
  value: ContentStatus;
  label: string;
}[] = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Arquivado" },
];

export const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

export const TYPE_LABELS: Record<ContentType, string> = {
  texto: "Texto",
  audio: "Áudio",
  video: "Vídeo",
  podcast: "Podcast",
  jindungo: "Jindungo",
};

export const MEDIA_ACCEPT_BY_TYPE: Record<ContentType, string> = {
  texto: "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif",
  audio:
    "audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,.mp3,.wav,.ogg,.m4a,.aac",
  podcast:
    "audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/x-m4a,audio/aac,.mp3,.wav,.ogg,.m4a,.aac",
  video:
    "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov",
  jindungo: "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif",
};

export const MEDIA_HINT_BY_TYPE: Record<ContentType, string> = {
  texto: "Imagens JPEG, PNG, WebP ou GIF (opcional, para ilustrar o texto).",
  audio: "Ficheiros de áudio MP3, WAV, OGG, M4A ou AAC.",
  podcast: "Episódios em MP3, WAV, OGG, M4A ou AAC.",
  video: "Vídeos MP4, WebM ou MOV.",
  jindungo: "Imagem de capa JPEG, PNG, WebP ou GIF (opcional).",
};

export function getMediaAcceptForType(type: ContentType): string {
  return MEDIA_ACCEPT_BY_TYPE[type];
}

export function emptyContentForm(): ContentFormValues {
  return {
    category_id: "",
    title: "",
    slug: "",
    body: "",
    type: "texto",
    media_url: "",
    statistics_data: "",
    is_exclusive: false,
    status: "draft",
  };
}

export function contentToFormValues(content: AdminContent): ContentFormValues {
  return {
    category_id: content.category ? String(content.category.id) : "",
    title: content.title,
    slug: content.slug,
    body: content.body ?? "",
    type: content.type,
    media_url: content.media_url ?? "",
    statistics_data: content.statistics_data ?? "",
    is_exclusive: Boolean(content.is_exclusive),
    status: content.status,
  };
}

import { resolveMediaUrl } from "@/components/content/media-player-utils";

export function resolveAdminMediaUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith("blob:")) {
    return url;
  }

  return resolveMediaUrl(url);
}
