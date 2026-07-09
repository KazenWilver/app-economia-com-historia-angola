export interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
  provinceId: string;
  avatarUrl: string;
}

export interface ProfileFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  provinceId?: string;
  avatarUrl?: string;
  form?: string;
}

export function buildProfileFormValues(user: {
  name: string;
  email: string;
  phone: string | null;
  province_id: number | null;
  avatar_url: string | null;
}): ProfileFormValues {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    provinceId: user.province_id ? String(user.province_id) : "",
    avatarUrl: user.avatar_url ?? "",
  };
}

export function validateProfileForm(values: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "O nome é obrigatório.";
  }

  if (!values.email.trim()) {
    errors.email = "O email é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "O email deve ser válido.";
  }

  if (!values.provinceId) {
    errors.provinceId = "A província é obrigatória.";
  }

  if (values.avatarUrl.trim() && !/^https?:\/\/.+/i.test(values.avatarUrl.trim())) {
    errors.avatarUrl = "O avatar deve ser um URL válido.";
  }

  return errors;
}

export function buildProfileUpdatePayload(values: ProfileFormValues) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    province_id: Number(values.provinceId),
    avatar_url: values.avatarUrl.trim() || null,
  };
}
