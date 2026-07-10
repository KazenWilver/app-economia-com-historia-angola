"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LogOut } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button, Card, CardContent, Skeleton, ThemeToggle } from "@/components/ui";

export function AdminLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, isLoading, logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/admin/login");
    }
  }, [isAdmin, isLoading, router]);

  // Sempre o mesmo shell no SSR e no 1.º paint do cliente (isLoading=true).
  if (isLoading || !isAdmin || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-surface md:flex-row dark:bg-surface-dark">
        <Skeleton className="h-20 w-full bg-surface-secondary md:h-screen md:w-64 dark:bg-surface-dark-secondary" />
        <div className="flex flex-1 flex-col gap-4 p-6">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-64 bg-surface-secondary dark:bg-surface-dark-secondary" />
              <Skeleton className="h-48 w-full bg-surface-secondary dark:bg-surface-dark-secondary" />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <Card
                hoverLift={false}
                className="max-w-md border-border bg-surface-card text-content-primary dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary"
              >
                <CardContent className="py-10 text-center text-content-secondary dark:text-content-dark-secondary">
                  <p className="font-display text-lg font-bold text-content-primary dark:text-content-dark-primary">
                    A redirecionar para o login do painel…
                  </p>
                  <p className="mt-2 text-sm text-content-tertiary dark:text-content-dark-tertiary">
                    Esta área é exclusiva de administradores.
                  </p>
                  <Link
                    href="/admin/login"
                    className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-bordeaux px-4 py-2.5 font-display text-sm font-semibold text-white dark:bg-bordeaux-dark"
                  >
                    Ir para o login admin
                  </Link>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface md:flex-row dark:bg-surface-dark">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col bg-surface-secondary dark:bg-surface-dark">
        <header className="flex items-center justify-between border-b border-border bg-surface-card px-4 py-4 dark:border-border-dark dark:bg-surface-dark-card sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
              Painel administrativo
            </p>
            <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
              Sessão:{" "}
              <span className="font-semibold text-content-primary dark:text-content-dark-primary">
                {user.name}
              </span>
              {pathname !== "/admin" ? (
                <span className="text-content-tertiary dark:text-content-dark-tertiary">
                  {" "}
                  · {pathname}
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              className="min-h-10"
              onClick={() => void handleLogout()}
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
              Sair
            </Button>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
