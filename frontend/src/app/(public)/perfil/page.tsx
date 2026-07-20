"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileLearningProgress } from "@/components/profile/ProfileLearningProgress";
import { ProfileRecommendations } from "@/components/profile/ProfileRecommendations";
import { ProfileShortcuts } from "@/components/profile/ProfileShortcuts";
import {
  buildProfileFormValues,
  type ProfileFormErrors,
  type ProfileFormValues,
} from "@/components/profile/profile-types";
import type { ProvincesResponse } from "@/components/ranking/ranking-types";
import { resolveMediaUrl } from "@/components/content/media-player-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-10 w-48" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Skeleton className="h-[28rem] w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateProfile, getFirstName } = useAuth();
  const [values, setValues] = useState<ProfileFormValues | null>(null);
  const [provinces, setProvinces] = useState<ProvincesResponse["data"]>([]);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProvinces = useCallback(async () => {
    try {
      const data = await apiFetch<ProvincesResponse>("/provinces", {
        cacheTtlMs: 300_000,
      });
      setProvinces(data.data);
    } catch {
      setProvinces([]);
    }
  }, []);

  useEffect(() => {
    void loadProvinces();
  }, [loadProvinces]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?redirect=%2Fperfil");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setValues(buildProfileFormValues(user));
    }
  }, [user]);

  const avatarPreview = useMemo(() => {
    if (values?.avatarPreviewUrl) {
      return values.avatarPreviewUrl;
    }

    const url = values?.avatarUrl.trim() || user?.avatar_url || null;
    return url ? resolveMediaUrl(url) : null;
  }, [user?.avatar_url, values?.avatarPreviewUrl, values?.avatarUrl]);

  const handleSubmit = async (
    payload: Parameters<typeof updateProfile>[0],
  ) => {
    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      await updateProfile(payload);
      setSuccessMessage("Os teus dados foram guardados com sucesso.");
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível actualizar o perfil.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !isAuthenticated || !user || !values) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bordeaux text-lg font-bold text-white dark:bg-bordeaux-dark">
            {avatarPreview ? (
              <Image
                src={avatarPreview}
                alt={`Avatar de ${user.name}`}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span aria-hidden>{getInitials(user.name)}</span>
            )}
          </div>

          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-bordeaux/10 px-3 py-1 font-display text-xs font-semibold tracking-display text-bordeaux dark:bg-bordeaux-dark/15 dark:text-bordeaux-dark">
              <User className="h-3.5 w-3.5" strokeWidth={1.5} />
              Perfil
            </div>
            <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
              Olá, {getFirstName(user.name)}
            </h1>
            <p className="mt-1 text-content-secondary dark:text-content-dark-secondary">
              Gere os teus dados e acede rapidamente às áreas da plataforma.
            </p>
          </div>
        </div>

        {user.province ? (
          <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
            Província:{" "}
            <span className="font-semibold text-content-primary dark:text-content-dark-primary">
              {user.province.name}
            </span>
          </p>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card hoverLift={false}>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileForm
              values={values}
              provinces={provinces}
              errors={errors}
              isSubmitting={isSubmitting}
              successMessage={successMessage}
              onChange={setValues}
              onErrorsChange={setErrors}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ProfileLearningProgress />
          <ProfileShortcuts />
        </div>
      </div>

      <div className="mt-6">
        <ProfileRecommendations />
      </div>
    </div>
  );
}
