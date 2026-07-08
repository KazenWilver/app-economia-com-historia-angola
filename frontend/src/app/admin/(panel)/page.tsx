import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-content-dark-primary">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-600 dark:text-content-dark-secondary">
          Bem-vindo ao painel de administração do Jindungo.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card hoverLift={false} className="border-slate-200 bg-white dark:border-border-dark dark:bg-surface-dark-card">
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-content-dark-primary">
              Conteúdos
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 dark:text-content-dark-secondary">
            Gerir artigos, áudios, vídeos e textos Jindungo.
          </CardContent>
        </Card>

        <Card hoverLift={false} className="border-slate-200 bg-white dark:border-border-dark dark:bg-surface-dark-card">
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-content-dark-primary">
              Utilizadores
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 dark:text-content-dark-secondary">
            Administrar contas e permissões da plataforma.
          </CardContent>
        </Card>

        <Card hoverLift={false} className="border-slate-200 bg-white dark:border-border-dark dark:bg-surface-dark-card">
          <CardHeader>
            <CardTitle className="text-base text-slate-900 dark:text-content-dark-primary">
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 dark:text-content-dark-secondary">
            Métricas e relatórios serão adicionados na próxima fase.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
