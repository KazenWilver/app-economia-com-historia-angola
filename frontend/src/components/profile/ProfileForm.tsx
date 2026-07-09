"use client";

import { FormEvent } from "react";
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
  const handleFieldChange = (field: keyof ProfileFormValues, value: string) => {
    onChange({ ...values, [field]: value });
    onErrorsChange({ ...errors, [field]: undefined, form: undefined });
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

      <Input
        label="URL do avatar"
        name="avatarUrl"
        type="url"
        value={values.avatarUrl}
        error={errors.avatarUrl}
        placeholder="https://exemplo.ao/avatar.png"
        onChange={(event) => handleFieldChange("avatarUrl", event.target.value)}
      />

      <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting}>
        Guardar alterações
      </Button>
    </form>
  );
}
