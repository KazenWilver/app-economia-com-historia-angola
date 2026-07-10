/** Extrai email/token de um link de reset (web ou deep link). */
export function parsePasswordResetLink(
  link: string,
  fallbackEmail = "",
): { email: string; token: string } | null {
  const tokenMatch = link.match(/[?&]token=([^&]+)/i);
  const emailMatch = link.match(/[?&]email=([^&]+)/i);

  if (!tokenMatch?.[1]) {
    return null;
  }

  const token = decodeURIComponent(tokenMatch[1]);
  const email = emailMatch?.[1]
    ? decodeURIComponent(emailMatch[1])
    : fallbackEmail;

  if (!token) {
    return null;
  }

  return { email, token };
}
