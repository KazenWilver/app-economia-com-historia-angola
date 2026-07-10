export interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
  provinceId: string;
  avatarUrl: string;
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
}

export interface ProfileFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  provinceId?: string;
  avatarUrl?: string;
  avatarFile?: string;
  form?: string;
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

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
    avatarFile: null,
    avatarPreviewUrl: null,
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

  if (
    !values.avatarFile &&
    values.avatarUrl.trim() &&
    !/^https?:\/\/.+/i.test(values.avatarUrl.trim())
  ) {
    errors.avatarUrl = "O avatar deve ser um URL válido.";
  }

  if (values.avatarFile) {
    if (!ALLOWED_AVATAR_TYPES.has(values.avatarFile.type)) {
      errors.avatarFile = "A fotografia deve ser JPG, PNG, WEBP ou GIF.";
    } else if (values.avatarFile.size > MAX_AVATAR_BYTES) {
      errors.avatarFile = "A fotografia não pode exceder 2 MB.";
    }
  }

  return errors;
}

export function buildProfileUpdatePayload(values: ProfileFormValues) {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim() || null,
    province_id: Number(values.provinceId),
    avatar_url: values.avatarFile ? undefined : values.avatarUrl.trim() || null,
    avatar: values.avatarFile,
  };
}
