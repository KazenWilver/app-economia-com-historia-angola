import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContentArticleView } from "@/components/content/ContentArticleView";
import { ContentExclusiveGate } from "@/components/content/ContentExclusiveGate";
import type { ContentDetailResponse } from "@/components/content/types";
import { Card, CardContent } from "@/components/ui";
import { serverApiFetch } from "@/lib/server-api";

export const dynamic = "force-dynamic";

interface ContentDetailPageProps {
  params: Promise<{ slug: string }>;
}

function BackLink() {
  return (
    <Link
      href="/explorar"
      className="mb-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-bordeaux transition-colors hover:text-bordeaux/80 dark:text-bordeaux-dark dark:hover:text-bordeaux-dark/80"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      Voltar a Explorar
    </Link>
  );
}

export default async function ContentDetailPage({
  params,
}: ContentDetailPageProps) {
  const { slug } = await params;
  const result = await serverApiFetch<ContentDetailResponse>(
    `/contents/${slug}`,
    { revalidate: false },
  );

  if (result.ok) {
    return <ContentArticleView content={result.data.data} />;
  }

  if (result.status === 401 || result.status === 403) {
    return <ContentExclusiveGate slug={slug} />;
  }

  if (result.status === 404) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <BackLink />
        <Card hoverLift={false}>
          <CardContent className="py-10 text-center">
            <p className="font-display text-xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
              Conteúdo não encontrado
            </p>
            <p className="mt-2 text-sm text-content-secondary dark:text-content-dark-secondary">
              O conteúdo que procuras não existe ou foi removido.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <BackLink />
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
            Não foi possível carregar o conteúdo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
