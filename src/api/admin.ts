import { apiClient, seg } from "./client";
import { getToken } from "../utils/tokenStorage";
import type { Puja, Priest } from "./connect";
import type { TempleEvent, TemplePuja } from "./temples";

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
  stats: { users: number; priests: number; pujas: number; bookings: number; donations: number; temples: number };
  recentBookings: any[];
}

export interface DailySuggestion {
  id?: string;
  title: string;
  body: string;
  type?: string;
  nakshatra?: string | null;
  rashi?: string | null;
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
  city?: string | null;
  state?: string | null;
}

export interface ChatUser {
  id: string;
  name: string;
  unreadCount: number;
  lastMessageAt: string | null;
}

export interface ChatMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface AdminTemple {
  id: string;
  name: string;
  placeId: string;
  source: string;
  deityName: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lon: number | null;
  contactDetails: string | null;
  templeHistory: string | null;
  significance: string | null;
  sevas: string | null;
  websiteLink: string | null;
  events: TempleEvent[];
  templePujas: TemplePuja[];
}

export interface KbArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: "cultural" | "kids" | "etiquette";
  imageUrl: string | null;
}

export const KB_CATEGORIES: KbArticle["category"][] = ["cultural", "kids", "etiquette"];

// ── Dashboard ──

export async function getAdminDashboard(): Promise<AdminStats> {
  const { data } = await apiClient.get("/admin/dashboard");
  return data;
}

// ── Priests ──

export type PriestInput = Partial<Pick<Priest, "name" | "phone" | "languages" | "experienceYears" | "qualifications" | "bio" | "specialization" | "verified">> & {
  pujaIds?: string[];
  email?: string;
  password?: string;
};

export async function createPriest(priestData: PriestInput): Promise<Priest> {
  const { data } = await apiClient.post("/admin/priests", priestData);
  return data;
}

export async function updatePriest(id: string, priestData: PriestInput): Promise<Priest> {
  const { data } = await apiClient.patch(`/admin/priests/${seg(id)}`, priestData);
  return data;
}

export async function deletePriest(id: string): Promise<void> {
  await apiClient.delete(`/admin/priests/${seg(id)}`);
}

// ── Pujas ──

export async function createPuja(pujaData: Partial<Puja>): Promise<Puja> {
  const { data } = await apiClient.post("/admin/pujas", pujaData);
  return data;
}

export async function updatePuja(id: string, pujaData: Partial<Puja>): Promise<Puja> {
  const { data } = await apiClient.patch(`/admin/pujas/${seg(id)}`, pujaData);
  return data;
}

/** Returns a message when the puja had bookings and was deactivated instead of deleted. */
export async function deletePuja(id: string): Promise<string | null> {
  const res = await apiClient.delete(`/admin/pujas/${seg(id)}`);
  return res.status === 200 ? res.data?.message ?? null : null;
}

// ── Priest booking actions ──

export async function acceptBooking(id: string): Promise<any> {
  const { data } = await apiClient.post(`/admin/bookings/${seg(id)}/accept`);
  return data;
}

export async function rejectBooking(id: string): Promise<any> {
  const { data } = await apiClient.post(`/admin/bookings/${seg(id)}/reject`);
  return data;
}

export async function completeBooking(id: string): Promise<any> {
  const { data } = await apiClient.post(`/admin/bookings/${seg(id)}/complete`);
  return data;
}

// ── Notifications ──

export async function getNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get("/admin/notifications");
  return data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.patch(`/admin/notifications/${seg(id)}/read`);
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

// ── Search helpers ──

export async function autocompletePlaces(q: string): Promise<AutocompleteItem[]> {
  const { data } = await apiClient.get("/admin/autocomplete", { params: { q } });
  return data;
}

export async function getMapTemples(params?: { lat?: number; lng?: number; state?: string }): Promise<MapTemple[]> {
  const { data } = await apiClient.get("/admin/map-temples", { params });
  return data;
}

// ── Chat ──

export async function getChatUsers(): Promise<ChatUser[]> {
  const { data } = await apiClient.get("/chat/users");
  return data;
}

export async function getMessages(userId: string): Promise<ChatMessage[]> {
  const { data } = await apiClient.get(`/chat/${seg(userId)}`);
  return data;
}

export async function sendMessage(userId: string, text: string): Promise<ChatMessage> {
  const { data } = await apiClient.post(`/chat/${seg(userId)}`, { text });
  return data;
}

export async function markChatRead(userId: string): Promise<void> {
  await apiClient.patch(`/chat/${seg(userId)}/read`);
}

// ── Knowledge base ──

export async function listKbArticles(): Promise<KbArticle[]> {
  const { data } = await apiClient.get("/admin/kb");
  return data;
}

export async function createKbArticle(article: Omit<KbArticle, "id" | "imageUrl" | "summary"> & { summary?: string }): Promise<KbArticle> {
  const { data } = await apiClient.post("/admin/kb", article);
  return data;
}

export async function updateKbArticle(id: string, article: Partial<KbArticle>): Promise<KbArticle> {
  const { data } = await apiClient.patch(`/admin/kb/${seg(id)}`, article);
  return data;
}

export async function deleteKbArticle(id: string): Promise<void> {
  await apiClient.delete(`/admin/kb/${seg(id)}`);
}

// ── FAQs ──

export async function listAdminFaqs(): Promise<{ id: string; question: string; answer: string }[]> {
  const { data } = await apiClient.get("/admin/faqs");
  return data;
}

export async function createFaq(faq: { question: string; answer: string }): Promise<any> {
  const { data } = await apiClient.post("/admin/faqs", faq);
  return data;
}

export async function updateFaq(id: string, faq: { question?: string; answer?: string }): Promise<any> {
  const { data } = await apiClient.patch(`/admin/faqs/${seg(id)}`, faq);
  return data;
}

export async function deleteFaq(id: string): Promise<void> {
  await apiClient.delete(`/admin/faqs/${seg(id)}`);
}

// ── Daily suggestions ──

export async function listSuggestions(): Promise<DailySuggestion[]> {
  const { data } = await apiClient.get("/admin/suggestions");
  return data;
}

export async function createSuggestion(sug: DailySuggestion): Promise<DailySuggestion> {
  const { data } = await apiClient.post("/admin/suggestions", sug);
  return data;
}

export async function updateSuggestion(id: string, sug: Partial<DailySuggestion>): Promise<DailySuggestion> {
  const { data } = await apiClient.patch(`/admin/suggestions/${seg(id)}`, sug);
  return data;
}

export async function deleteSuggestion(id: string): Promise<void> {
  await apiClient.delete(`/admin/suggestions/${seg(id)}`);
}

export async function sendDailySuggestionPush(): Promise<{ sent: number; total: number }> {
  const { data } = await apiClient.post("/admin/daily-suggestion-push");
  return data;
}

// ── Temples ──

export async function importTemplesCSV(csv: string): Promise<{ created: number; merged: number; skipped: number; googleEnriched: number }> {
  const { data } = await apiClient.post("/admin/import-temples", { csv });
  return data;
}

export async function uploadTemplesFile(file: { uri: string; name: string; type: string }): Promise<{
  created: number; updated: number; skipped: number; total: number; errors?: string[];
  details?: { row: number; name: string; action: "created" | "merged"; into?: string; previousSource?: string }[];
}> {
  const formData = new FormData();
  formData.append("file", file as any);
  const { data } = await apiClient.post("/admin/temples/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });
  return data;
}

/** URL + auth header for downloading the Excel template (the endpoint requires the admin token). */
export async function getTempleTemplateRequest(): Promise<{ url: string; headers: Record<string, string> }> {
  const token = await getToken();
  return {
    url: `${apiClient.defaults.baseURL}/admin/temples/template`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}

/** Curated temples by default; `includeSaved` also returns temples auto-saved from searches. */
export async function listAllDBTemples(includeSaved = false): Promise<AdminTemple[]> {
  const { data } = await apiClient.get("/admin/temples", { params: includeSaved ? { all: "true" } : {} });
  return data;
}

export async function updateDBTemple(id: string, templeData: Partial<AdminTemple>): Promise<AdminTemple> {
  const { data } = await apiClient.patch(`/admin/temples/${seg(id)}`, templeData);
  return data;
}

export async function deleteDBTemple(id: string): Promise<void> {
  await apiClient.delete(`/admin/temples/${seg(id)}`);
}

export async function addTempleEvent(templeId: string, event: { name: string; date: string; time?: string; description?: string }): Promise<AdminTemple> {
  const { data } = await apiClient.post(`/admin/temples/${seg(templeId)}/events`, event);
  return data;
}

export async function deleteTempleEvent(templeId: string, eventId: string): Promise<void> {
  await apiClient.delete(`/admin/temples/${seg(templeId)}/events/${seg(eventId)}`);
}

export async function addTemplePuja(templeId: string, puja: { name: string; schedule?: string; time?: string; description?: string }): Promise<AdminTemple> {
  const { data } = await apiClient.post(`/admin/temples/${seg(templeId)}/pujas`, puja);
  return data;
}

export async function deleteTemplePuja(templeId: string, pujaId: string): Promise<void> {
  await apiClient.delete(`/admin/temples/${seg(templeId)}/pujas/${seg(pujaId)}`);
}

// ── Push tokens ──

export async function registerPushToken(token: string): Promise<void> {
  await apiClient.post("/admin/push-token", { token });
}

export async function clearPushToken(): Promise<void> {
  await apiClient.delete("/admin/push-token");
}
