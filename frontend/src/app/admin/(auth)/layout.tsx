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
          <p className="font-display text-xl font-extrabold text-bordeaux dark:text-bordeaux-dark">
            <span aria-hidden>🌶️ </span>
            Jindungo Admin
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
