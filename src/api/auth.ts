import { apiClient } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post("/auth/register", { name, email, password });
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string, code: string }> {
  const { data } = await apiClient.post("/auth/forgot-password", { email });
  return data;
}

export async function resetPassword(email: string, token: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await apiClient.post("/auth/reset-password", { email, token, newPassword });
  return data;
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  const { data } = await apiClient.post("/auth/change-password", { oldPassword, newPassword });
  return data;
}
