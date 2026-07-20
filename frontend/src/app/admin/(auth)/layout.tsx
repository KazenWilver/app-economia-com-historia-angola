import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AdminAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-content-primary dark:bg-surface-dark dark:text-content-dark-primary">
      <header className="flex items-center justify-between border-b border-border px-6 py-5 dark:border-border-dark">
        <div>
          <p className="font-display text-lg font-extrabold leading-tight text-bordeaux dark:text-bordeaux-dark">
            Economia com História
            <span className="mt-0.5 block text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
              Administração
            </span>
          </p>
          <p className="mt-1 text-sm text-content-tertiary dark:text-content-dark-tertiary">
            Aplicação de gestão — independente do site público
          </p>
        </div>
        <ThemeToggle />
      </header>
      <div className="flex flex-1 items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
