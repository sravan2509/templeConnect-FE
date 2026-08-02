import { apiClient } from "./client";

// Re-export shared priest/puja functions from connect.ts to avoid duplicate definitions
export { listPujas, getPriestProfile, updatePriestProfile, getPriestStats } from "./connect";
export type { Puja } from "./connect";

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

export async function createPuja(pujaData: Partial<import("./connect").Puja>): Promise<import("./connect").Puja> {
  const { data } = await apiClient.post("/admin/pujas", pujaData);
  return data;
}

export async function updatePuja(id: string, pujaData: Partial<import("./connect").Puja>): Promise<import("./connect").Puja> {
  const { data } = await apiClient.patch(`/admin/pujas/${id}`, pujaData);
  return data;
}

export async function deletePuja(id: string): Promise<void> {
  await apiClient.delete(`/admin/pujas/${id}`);
}

export async function acceptBooking(id: string): Promise<any> {
  const { data } = await apiClient.post(`/admin/bookings/${id}/accept`);
  return data;
}

export async function rejectBooking(id: string): Promise<any> {
  const { data } = await apiClient.post(`/admin/bookings/${id}/reject`);
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

// ── Temple Events & Pujas Management ────────────────────────

export interface TempleEventInput {
  name: string;
  description?: string;
  date: string;
  time?: string;
}

export interface TemplePujaInput {
  name: string;
  description?: string;
  schedule?: string;
  time?: string;
}

export interface SaveTempleEventsInput {
  templeName: string;
  placeId: string;
  address?: string;
  city?: string;
  state?: string;
  lat?: number;
  lon?: number;
  events: TempleEventInput[];
  pujas: TemplePujaInput[];
}

export interface AdminTemple {
  id: string;
  name: string;
  placeId: string;
  address: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lon: number | null;
  createdAt: string;
  updatedAt: string;
  events: Array<{
    id: string;
    templeId: string;
    name: string;
    description: string | null;
    date: string;
    time: string | null;
    createdAt: string;
  }>;
  templePujas: Array<{
    id: string;
    templeId: string;
    name: string;
    description: string | null;
    schedule: string | null;
    time: string | null;
    createdAt: string;
  }>;
}

export async function saveTempleEventsAndPujas(input: SaveTempleEventsInput): Promise<AdminTemple> {
  const { data } = await apiClient.post("/admin/temple-events", input);
  return data;
}

export async function getAdminTemples(): Promise<AdminTemple[]> {
  const { data } = await apiClient.get("/admin/temple-events");
  return data;
}

export async function deleteTempleEvent(templeId: string, eventId: string): Promise<void> {
  await apiClient.delete(`/admin/temple-events/${templeId}/events/${eventId}`);
}

export async function deleteTemplePuja(templeId: string, pujaId: string): Promise<void> {
  await apiClient.delete(`/admin/temple-events/${templeId}/pujas/${pujaId}`);
}

export async function deleteAdminTemple(templeId: string): Promise<void> {
  await apiClient.delete(`/admin/temple-events/${templeId}`);
}

export async function submitReview(priestId: string, rating: number, comment?: string): Promise<any> {
  const { data } = await apiClient.post(`/priests/${priestId}/reviews`, { rating, comment });
  return data;
}

// KB Articles
export async function listKbArticles(): Promise<any[]> {
  const { data } = await apiClient.get("/admin/kb");
  return data;
}

export async function createKbArticle(article: any): Promise<any> {
  const { data } = await apiClient.post("/admin/kb", article);
  return data;
}

export async function updateKbArticle(id: string, article: any): Promise<any> {
  const { data } = await apiClient.patch(`/admin/kb/${id}`, article);
  return data;
}

export async function deleteKbArticle(id: string): Promise<void> {
  await apiClient.delete(`/admin/kb/${id}`);
}

// FAQs
export async function createFaq(faq: any): Promise<any> {
  const { data } = await apiClient.post("/admin/faqs", faq);
  return data;
}

export async function updateFaq(id: string, faq: any): Promise<any> {
  const { data } = await apiClient.patch(`/admin/faqs/${id}`, faq);
  return data;
}

export async function deleteFaq(id: string): Promise<void> {
  await apiClient.delete(`/admin/faqs/${id}`);
}

// Daily Suggestions
export async function listSuggestions(): Promise<any[]> {
  const { data } = await apiClient.get("/admin/suggestions");
  return data;
}

export async function createSuggestion(sug: any): Promise<any> {
  const { data } = await apiClient.post("/admin/suggestions", sug);
  return data;
}

export async function updateSuggestion(id: string, sug: any): Promise<any> {
  const { data } = await apiClient.patch(`/admin/suggestions/${id}`, sug);
  return data;
}

export async function deleteSuggestion(id: string): Promise<void> {
  await apiClient.delete(`/admin/suggestions/${id}`);
}

