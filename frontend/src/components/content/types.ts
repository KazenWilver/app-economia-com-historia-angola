export type {
  Author,
  Category,
  CommentItem,
  CommentUser,
  CommentsResponse,
  ContentDetail,
  ContentDetailResponse,
  ContentItem,
  ContentSummary,
  ContentType,
  ContentsResponse,
} from "@shared/types";

import type { ContentItem } from "@shared/types";

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

export { API_URL, buildAuthHeaders, getStoredToken } from "@/lib/api";

export { formatMediaTime as formatTime, resolveMediaUrl } from "@/components/content/media-player-utils";

const IMAGE_MEDIA_PATTERN = /\.(jpe?g|png|webp|gif)$/i;

export function isImageMediaUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }

  const path = url.split("?")[0]?.split("#")[0] ?? "";

  return IMAGE_MEDIA_PATTERN.test(path);
}
