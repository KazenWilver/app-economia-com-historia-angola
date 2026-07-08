export default function AdminAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0F172A] text-[#F8FAFC]">
      <header className="border-b border-slate-800 px-6 py-5">
        <p className="font-display text-xl font-extrabold text-bordeaux-dark">
          <span aria-hidden>🌶️ </span>
          Jindungo Admin
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Aplicação de gestão — independente do site público
        </p>
      </header>
      <div className="flex flex-1 items-center justify-center p-6">
        {children}
      </div>
    </div>
  );
}
