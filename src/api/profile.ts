import { apiClient, seg } from "./client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Checkin {
  id: string;
  templeName: string;
  placeId?: string;
  lat?: number;
  lon?: number;
  visitedAt: string;
}

export interface Donation {
  id: string;
  templeName: string;
  amount: number;
  placeId?: string;
  donatedAt: string;
}

export interface NotificationPrefs {
  pujaReminders: boolean;
  templeEventAlerts: boolean;
  bookingUpdates: boolean;
  promotionalOffers: boolean;
  dailySuggestions: boolean;
}

export interface Bookmark {
  id: string;
  placeId: string;
  name: string;
  address?: string;
  lat?: number;
  lon?: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export async function getMe(): Promise<UserProfile> {
  const { data } = await apiClient.get("/users/me");
  return data;
}

export async function updateMe(name: string): Promise<UserProfile> {
  const { data } = await apiClient.patch("/users/me", { name });
  return data;
}

export async function deleteAccount(password: string): Promise<void> {
  await apiClient.delete("/users/me", { data: { password } });
}

export async function getCheckins(): Promise<Checkin[]> {
  const { data } = await apiClient.get("/users/me/checkins");
  return data;
}

export async function createCheckin(templeName: string, placeId?: string, lat?: number, lon?: number): Promise<Checkin> {
  const { data } = await apiClient.post("/users/me/checkins", { templeName, placeId, lat, lon });
  return data;
}

export async function getDonations(): Promise<Donation[]> {
  const { data } = await apiClient.get("/users/me/donations");
  return data;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const { data } = await apiClient.get("/users/me/bookmarks");
  return data;
}

export async function createBookmark(placeId: string, name: string, address?: string, lat?: number, lon?: number): Promise<Bookmark> {
  const { data } = await apiClient.post("/users/me/bookmarks", { placeId, name, address, lat, lon });
  return data;
}

export async function deleteBookmark(id: string): Promise<void> {
  await apiClient.delete(`/users/me/bookmarks/${seg(id)}`);
}

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const { data } = await apiClient.get("/users/me/notification-preferences");
  return data;
}

export async function updateNotificationPrefs(prefs: Partial<NotificationPrefs>): Promise<NotificationPrefs> {
  const { data } = await apiClient.patch("/users/me/notification-preferences", prefs);
  return data;
}

export async function getBookingHistory(): Promise<any[]> {
  const { data } = await apiClient.get("/users/me/bookings-history");
  return data;
}

export async function getFAQs(): Promise<{ id: string; question: string; answer: string; category?: string }[]> {
  const { data } = await apiClient.get("/support/faqs");
  return data;
}

export async function createSupportTicket(subject: string, message: string): Promise<SupportTicket> {
  const { data } = await apiClient.post("/support/tickets", { subject, message });
  return data;
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  const { data } = await apiClient.get("/support/tickets");
  return data;
}

export async function searchKnowledgeBase(query?: string): Promise<any[]> {
  const { data } = await apiClient.get("/knowledge-base", { params: query ? { query } : {} });
  return data;
}
