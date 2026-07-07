"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

export function WelcomeBanner() {
  const { consumeWelcomeMessage } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(consumeWelcomeMessage());
  }, [consumeWelcomeMessage]);

  if (!firstName) {
    return null;
  }

  return (
    <Toast
      variant="success"
      title={`Bem-vindo, ${firstName}!`}
      message="A tua sessão foi iniciada com sucesso."
      className="mx-auto mb-6 w-full max-w-2xl"
    />
  );
}
