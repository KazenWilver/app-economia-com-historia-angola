export type UserRole = "user" | "admin";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
}

export interface AdminUserStatusResponse {
  message: string;
  user: AdminUser;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "Utilizador",
  admin: "Administrador",
};
