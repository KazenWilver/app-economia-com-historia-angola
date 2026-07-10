"use client";

import { FormEvent, useEffect, useId, useRef } from "react";
import { ImagePlus } from "lucide-react";
import { ProvinceSelectField } from "@/components/auth/ProvinceSelectField";
import type { ProvinceOption } from "@/components/auth/ProvinceSelectField";
import {
  buildProfileUpdatePayload,
  type ProfileFormErrors,
  type ProfileFormValues,
  validateProfileForm,
} from "@/components/profile/profile-types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";

interface ProfileFormProps {
  values: ProfileFormValues;
  provinces: ProvinceOption[];
  errors: ProfileFormErrors;
  isSubmitting: boolean;
  successMessage: string | null;
  onChange: (values: ProfileFormValues) => void;
  onErrorsChange: (errors: ProfileFormErrors) => void;
  onSubmit: (payload: ReturnType<typeof buildProfileUpdatePayload>) => Promise<void>;
}

export function ProfileForm({
  values,
  provinces,
  errors,
  isSubmitting,
  successMessage,
  onChange,
  onErrorsChange,
  onSubmit,
}: ProfileFormProps) {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFieldChange = (field: keyof ProfileFormValues, value: string) => {
    onChange({ ...values, [field]: value });
    onErrorsChange({ ...errors, [field]: undefined, form: undefined });
  };

  const handleAvatarFileChange = (file: File | null) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!file) {
      onChange({
        ...values,
        avatarFile: null,
        avatarPreviewUrl: null,
      });
      onErrorsChange({
        ...errors,
        avatarFile: undefined,
        form: undefined,
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;

    onChange({
      ...values,
      avatarFile: file,
      avatarPreviewUrl: previewUrl,
      avatarUrl: "",
    });
    onErrorsChange({
      ...errors,
      avatarFile: undefined,
      avatarUrl: undefined,
      form: undefined,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateProfileForm(values);
    onErrorsChange(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit(buildProfileUpdatePayload(values));
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
      {errors.form ? (
        <Toast variant="error" title="Erro ao guardar" message={errors.form} />
      ) : null}

      {successMessage ? (
        <Toast variant="success" title="Perfil actualizado" message={successMessage} />
      ) : null}

      <Input
        label="Nome"
        name="name"
        autoComplete="name"
        value={values.name}
        error={errors.name}
        onChange={(event) => handleFieldChange("name", event.target.value)}
      />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={values.email}
        error={errors.email}
        onChange={(event) => handleFieldChange("email", event.target.value)}
      />

      <Input
        label="Telefone"
        name="phone"
        type="tel"
        autoComplete="tel"
        value={values.phone}
        error={errors.phone}
        placeholder="+244 9XX XXX XXX"
        onChange={(event) => handleFieldChange("phone", event.target.value)}
      />

      <ProvinceSelectField
        value={values.provinceId}
        provinces={provinces}
        error={errors.provinceId}
        onChange={(value) => handleFieldChange("provinceId", value)}
      />

      <div className="flex flex-col gap-1.5">
        <span className="font-display text-sm font-semibold tracking-display text-content-primary dark:text-content-dark-primary">
          Fotografia de perfil
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              handleAvatarFileChange(file);
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" strokeWidth={1.5} />
            Escolher do dispositivo
          </Button>
          {values.avatarFile ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                handleAvatarFileChange(null);
              }}
            >
              Remover ficheiro
            </Button>
          ) : null}
        </div>
        {values.avatarFile ? (
          <p className="text-xs text-content-secondary dark:text-content-dark-secondary">
            Seleccionado: {values.avatarFile.name}
          </p>
        ) : (
          <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
            JPG, PNG, WEBP ou GIF · máximo 2 MB
          </p>
        )}
        {errors.avatarFile ? (
          <p className="text-xs text-error-light dark:text-error-dark" role="alert">
            {errors.avatarFile}
          </p>
        ) : null}
      </div>

      <Input
        label="URL do avatar (opcional)"
        name="avatarUrl"
        type="url"
        value={values.avatarUrl}
        error={errors.avatarUrl}
        placeholder="https://exemplo.ao/avatar.png"
        hint="Usado apenas se não escolheres uma fotografia do dispositivo."
        disabled={Boolean(values.avatarFile)}
        onChange={(event) => handleFieldChange("avatarUrl", event.target.value)}
      />

      <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting}>
        Guardar alterações
      </Button>
    </form>
  );
}
