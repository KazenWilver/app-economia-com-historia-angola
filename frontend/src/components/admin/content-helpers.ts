const DIRECT_MEDIA_PATTERN =
  /\.(jpe?g|png|webp|gif|mp3|wav|ogg|m4a|aac|mp4|webm|mov)(\?.*)?$/i;

export function isDirectMediaUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }

  const path = url.split("?")[0]?.split("#")[0] ?? "";

  return DIRECT_MEDIA_PATTERN.test(path);
}

export function slugifyPreview(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
