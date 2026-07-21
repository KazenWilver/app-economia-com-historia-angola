"use client";

import { UserGuidePanel } from "@/components/guide/UserGuidePanel";

export default function AdminAjudaPage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <UserGuidePanel
        audience="full"
        variant="admin"
        aboutHref="/admin/sobre-nos"
      />
    </div>
  );
}
