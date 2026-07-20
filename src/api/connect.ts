import { apiClient } from "./client";

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

export interface PriestPuja {
  puja: Puja;
  price?: number;
}

export interface Priest {
  id: string;
  userId?: string;
  name: string;
  phone?: string;
  specialization: string;
  languages: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  experienceYears: number;
  qualifications: string;
  bio?: string;
  avatar?: string;
  priestPujas?: PriestPuja[];
}

export interface Booking {
  id: string;
  priestId: string;
  pujaId: string;
  scheduledAt: string;
  status: string;
  paid: boolean;
  amount: number;
  notes?: string;
  priest?: { name: string };
  puja?: { name: string; icon: string };
}

// ── Pujas ─────────────────

export async function listPujas(): Promise<Puja[]> {
  const { data } = await apiClient.get("/admin/pujas");
  return data;
}

// ── Priests ──────────────

export async function listPriests(): Promise<Priest[]> {
  const { data } = await apiClient.get("/priests");
  return data;
}

export async function getPriestsByPuja(pujaId: string): Promise<Priest[]> {
  const { data } = await apiClient.get(`/priests/by-puja/${pujaId}`);
  return data;
}

export async function getPriest(id: string): Promise<Priest> {
  const { data } = await apiClient.get(`/priests/${id}`);
  return data;
}

export async function getPriestReviews(priestId: string): Promise<any[]> {
  const { data } = await apiClient.get(`/priests/${priestId}/reviews`);
  return data;
}

// ── Bookings ─────────────

export async function listBookings(status?: string): Promise<Booking[]> {
  const { data } = await apiClient.get("/bookings", { params: status ? { status } : {} });
  return data;
}

export async function createBooking(priestId: string, pujaId: string, scheduledAt: string, notes?: string): Promise<Booking> {
  const { data } = await apiClient.post("/bookings", { priestId, pujaId, scheduledAt, notes });
  return data;
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.get(`/bookings/${id}`);
  return data;
}

export async function rescheduleBooking(id: string, scheduledAt: string): Promise<Booking> {
  const { data } = await apiClient.patch(`/bookings/${id}/reschedule`, { scheduledAt });
  return data;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.delete(`/bookings/${id}`);
  return data;
}

// ── Priest Self-Service ──

export async function getPriestProfile(): Promise<Priest> {
  const { data } = await apiClient.get("/admin/priest/profile");
  return data;
}

export async function updatePriestProfile(profileData: any): Promise<Priest> {
  const { data } = await apiClient.patch("/admin/priest/profile", profileData);
  return data;
}

export async function getPriestStats(): Promise<any> {
  const { data } = await apiClient.get("/admin/priest/stats");
  return data;
}
