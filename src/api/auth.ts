import { apiClient } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
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
