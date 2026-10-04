import { apiClient } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  /** False for accounts created with Google that haven't set a password. */
  hasPassword?: boolean;
  googleLinked?: boolean;
  avatarUrl?: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
}

/** Exchanges a Google ID token for a Temple Connect session (signs in or creates the account). */
export async function googleSignIn(idToken: string): Promise<AuthResponse & { isNewUser: boolean }> {
  const { data } = await apiClient.post("/auth/google", { idToken });
  return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post("/auth/register", { name, email, password });
  return data;
}

/** `devCode` is only present when the backend runs with DEV_EXPOSE_RESET_CODE=true. */
export async function forgotPassword(email: string): Promise<{ message: string; devCode?: string }> {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(email: string, token: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await apiClient.post("/auth/reset-password", { email, token, newPassword });
  return data;
}

/**
 * Other sessions are signed out; the returned token replaces this device's token.
 * `oldPassword` may be omitted when a Google-only account sets its first password.
 */
export async function changePassword(oldPassword: string | undefined, newPassword: string): Promise<{ message: string } & AuthResponse> {
  const { data } = await apiClient.post("/auth/change-password", { oldPassword, newPassword });
  return data;
}

export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
