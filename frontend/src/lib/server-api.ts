/**
 * Fetch à API Laravel a partir de Server Components (RSC).
 * Não usa localStorage/tokens — adequado a dados públicos.
 */

export const SERVER_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type ServerApiResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; data: null };

type ServerFetchOptions = {
  /** Revalidação ISR em segundos. `false` = sem cache (no-store). */
  revalidate?: number | false;
  headers?: HeadersInit;
};

export async function serverApiFetch<T>(
  path: string,
  options: ServerFetchOptions = {},
): Promise<ServerApiResult<T>> {
  const { revalidate = 60, headers } = options;

  const init: RequestInit & { next?: { revalidate: number } } = {
    headers: {
      Accept: "application/json",
      ...(headers ?? {}),
    },
  };

  if (revalidate === false) {
    init.cache = "no-store";
  } else {
    init.next = { revalidate };
  }

  try {
    const response = await fetch(`${SERVER_API_URL}${path}`, init);
    const status = response.status;

    if (!response.ok) {
      return { ok: false, status, data: null };
    }

    const data = (await response.json()) as T;
    return { ok: true, status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}
