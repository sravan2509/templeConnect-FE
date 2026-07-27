import { apiClient } from "./client";

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface AdminStats {
  stats: { users: number; priests: number; pujas: number; bookings: number; donations: number };
  recentBookings: any[];
}

export interface Puja {
  id: string;
  name: string;
  description?: string;
  duration: string;
  basePrice: number;
  category: string;
  icon: string;
  active: boolean;
}

export interface PriestStats {
  stats: { total: number; pending: number; confirmed: number; completed: number };
  upcoming: any[];
  priest: any;
}

export interface DailySuggestion {
  id?: string;
  title: string;
  body: string;
  type?: string;
}

export interface AutocompleteItem {
  label: string;
  type: "state" | "temple";
  placeId?: string;
}

export interface MapTemple {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
}

export async function getAdminDashboard(): Promise<AdminStats> {
  const { data } = await apiClient.get("/admin/dashboard");
  return data;
}

export async function createPriest(priestData: any): Promise<any> {
  const { data } = await apiClient.post("/admin/priests", priestData);
  return data;
}

export async function updatePriest(id: string, priestData: any): Promise<any> {
  const { data } = await apiClient.patch(`/admin/priests/${id}`, priestData);
  return data;
}

export async function deletePriest(id: string): Promise<void> {
  await apiClient.delete(`/admin/priests/${id}`);
}

export async function listPujas(): Promise<Puja[]> {
  const { data } = await apiClient.get("/admin/pujas");
  return data;
}

export async function createPuja(pujaData: Partial<Puja>): Promise<Puja> {
  const { data } = await apiClient.post("/admin/pujas", pujaData);
  return data;
}

export async function deletePuja(id: string): Promise<void> {
  await apiClient.delete(`/admin/pujas/${id}`);
}

export async function getPriestProfile(): Promise<any> {
  const { data } = await apiClient.get("/admin/priest/profile");
  return data;
}

export async function updatePriestProfile(profileData: any): Promise<any> {
  const { data } = await apiClient.patch("/admin/priest/profile", profileData);
  return data;
}

export async function acceptBooking(id: string): Promise<any> {
  const { data } = await apiClient.post(`/admin/bookings/${id}/accept`);
  return data;
}

export async function rejectBooking(id: string): Promise<any> {
  const { data } = await apiClient.post(`/admin/bookings/${id}/reject`);
  return data;
}

export async function getPriestStats(): Promise<PriestStats> {
  const { data } = await apiClient.get("/admin/priest/stats");
  return data;
}

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get("/admin/notifications");
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/admin/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.post("/admin/notifications/read-all");
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const { data } = await apiClient.get("/admin/notifications/unread-count");
  return data;
}

export async function getDailySuggestion(): Promise<DailySuggestion> {
  const { data } = await apiClient.get("/admin/daily-suggestion");
  return data;
}

export async function autocompletePlaces(q: string): Promise<AutocompleteItem[]> {
  const { data } = await apiClient.get("/admin/autocomplete", { params: { q } });
  return data;
}

export async function getMapTemples(params?: { lat?: number; lng?: number; deity?: string; state?: string }): Promise<MapTemple[]> {
  const { data } = await apiClient.get("/admin/map-temples", { params });
  return data;
}

export interface KbArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string | null;
}

export async function listKbArticles(): Promise<KbArticle[]> {
  const { data } = await apiClient.get("/admin/kb");
  return data;
}

export async function createKbArticle(articleData: Partial<KbArticle>): Promise<KbArticle> {
  const { data } = await apiClient.post("/admin/kb", articleData);
  return data;
}

export async function updateKbArticle(id: string, articleData: Partial<KbArticle>): Promise<KbArticle> {
  const { data } = await apiClient.patch(`/admin/kb/${id}`, articleData);
  return data;
}

export async function deleteKbArticle(id: string): Promise<void> {
  await apiClient.delete(`/admin/kb/${id}`);
}

export async function getChatUsers(): Promise<any[]> {
  const { data } = await apiClient.get("/chat-users");
  return data;
}

export async function getMessages(userId: string): Promise<any[]> {
  const { data } = await apiClient.get(`/chat/${userId}`);
  return data;
}

export async function sendMessage(userId: string, text: string): Promise<any> {
  const { data } = await apiClient.post(`/chat/${userId}`, { text });
  return data;
}
