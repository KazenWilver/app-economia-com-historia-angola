import { ExplorarCatalog } from "@/components/content/ExplorarCatalog";
import type { ContentsResponse } from "@/components/content/types";
import { serverApiFetch } from "@/lib/server-api";

export const revalidate = 60;

export default async function ExplorarPage() {
  const result = await serverApiFetch<ContentsResponse>("/contents", {
    revalidate: 60,
  });

  const initialContents = result.ok ? result.data.data : [];
  const initialError = result.ok
    ? null
    : "Ocorreu um erro ao carregar os conteúdos. Tenta novamente mais tarde.";

  return (
    <ExplorarCatalog
      initialContents={initialContents}
      initialError={initialError}
    />
  );
}
