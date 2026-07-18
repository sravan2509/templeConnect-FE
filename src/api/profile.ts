import { apiClient } from "./client";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
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

export interface Subscription {
  plan: string;
  renewsAt: string | null;
  paymentMethod: string | null;
}

export interface NotificationPrefs {
  pujaReminders: boolean;
  templeEventAlerts: boolean;
  bookingUpdates: boolean;
  promotionalOffers: boolean;
}

export interface Bookmark {
  id: string;
  placeId: string;
  name: string;
  address?: string;
  lat?: number;
  lon?: number;
}

export async function getMe(): Promise<UserProfile> {
  const { data } = await apiClient.get("/users/me");
  return data;
}

export async function updateMe(name: string): Promise<UserProfile> {
  const { data } = await apiClient.patch("/users/me", { name });
  return data;
}

export async function getCheckins(): Promise<Checkin[]> {
  const { data } = await apiClient.get("/users/me/checkins");
  return data;
}

export async function createCheckin(
  templeName: string,
  placeId?: string,
  lat?: number,
  lon?: number
): Promise<Checkin> {
  const { data } = await apiClient.post("/users/me/checkins", { templeName, placeId, lat, lon });
  return data;
}

export async function getDonations(): Promise<Donation[]> {
  const { data } = await apiClient.get("/users/me/donations");
  return data;
}

export async function createDonation(templeName: string, amount: number, placeId?: string): Promise<Donation> {
  const { data } = await apiClient.post("/donations", { templeName, amount, placeId });
  return data;
}

export async function getBookmarks(): Promise<Bookmark[]> {
  const { data } = await apiClient.get("/users/me/bookmarks");
  return data;
}

export async function createBookmark(
  placeId: string,
  name: string,
  address?: string,
  lat?: number,
  lon?: number
): Promise<Bookmark> {
  const { data } = await apiClient.post("/users/me/bookmarks", { placeId, name, address, lat, lon });
  return data;
}

export async function deleteBookmark(id: string): Promise<void> {
  await apiClient.delete(`/users/me/bookmarks/${id}`);
}

export async function getSubscriptionPlan(): Promise<Subscription> {
  const { data } = await apiClient.get("/subscriptions/plan");
  return data;
}

export async function upgradePlan(plan: "premium_monthly" | "premium_yearly"): Promise<Subscription> {
  const { data } = await apiClient.post("/subscriptions/upgrade", { plan });
  return data;
}

export async function cancelSubscription(): Promise<Subscription> {
  const { data } = await apiClient.post("/subscriptions/cancel");
  return data;
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

export async function createSupportTicket(subject: string, message: string): Promise<any> {
  const { data } = await apiClient.post("/support/tickets", { subject, message });
  return data;
}

export async function getDashboard(): Promise<any> {
  const { data } = await apiClient.get("/home/dashboard");
  return data;
}

export async function getDosAndDonts(): Promise<string[]> {
  const { data } = await apiClient.get("/home/dos-and-donts");
  return data;
}

export async function searchKnowledgeBase(query?: string): Promise<any[]> {
  const { data } = await apiClient.get("/knowledge-base", { params: query ? { query } : {} });
  return data;
}
