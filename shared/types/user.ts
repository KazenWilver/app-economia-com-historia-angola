import type { Province } from "./province";

export type UserRole = "user" | "admin";

export interface UserSummary {
  id: number;
  name: string;
  email?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  province_id: number | null;
  province: Province | null;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string | null;
  avatar_url?: string | null;
  province_id?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MeResponse {
  user: User;
}
