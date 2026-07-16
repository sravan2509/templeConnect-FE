import { apiClient, MOCK_API } from "./client";

// TODO(revert): delete this mock block
const MOCK_AUTH_RESPONSE: AuthResponse = {
  token: "mock-token",
  user: { id: "mock-user-id", name: "Mock User", email: "mock@example.com" },
};

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
  if (MOCK_API) return MOCK_AUTH_RESPONSE; // TODO(revert)
  const { data } = await apiClient.post("/auth/login", { email, password });
  return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  if (MOCK_API) return MOCK_AUTH_RESPONSE; // TODO(revert)
  const { data } = await apiClient.post("/auth/register", { name, email, password });
  return data;
}
