import { apiClient, seg } from "./client";

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
  pujaId: string;
  puja: Puja;
  price?: number | null;
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
  /** Price for the puja the list was fetched for (getPriestsByPuja only). */
  price?: number | null;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: { name: string };
}

export interface Booking {
  id: string;
  priestId: string;
  pujaId: string;
  scheduledAt: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | string;
  paid: boolean;
  amount: number;
  notes?: string;
  reviewed?: boolean;
  priest?: { name: string; userId?: string | null; phone?: string | null };
  puja?: { name: string; icon: string; duration?: string };
}

/** Free cancellation window for confirmed bookings (matches the backend rule). */
export const CANCELLATION_WINDOW_HOURS = 24;

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
  const { data } = await apiClient.get(`/priests/by-puja/${seg(pujaId)}`);
  return data;
}

export async function getPriest(id: string): Promise<Priest & { reviews: Review[] }> {
  const { data } = await apiClient.get(`/priests/${seg(id)}`);
  return data;
}

export async function getPriestReviews(priestId: string): Promise<Review[]> {
  const { data } = await apiClient.get(`/priests/${seg(priestId)}/reviews`);
  return data;
}

export async function submitReview(priestId: string, rating: number, comment?: string): Promise<{ newRating: number; reviewCount: number }> {
  const { data } = await apiClient.post(`/priests/${seg(priestId)}/reviews`, { rating, comment });
  return data;
}

// ── Bookings ─────────────

export async function listBookings(status?: "upcoming" | "past"): Promise<Booking[]> {
  const { data } = await apiClient.get("/bookings", { params: status ? { status } : {} });
  return data;
}

export async function createBooking(priestId: string, pujaId: string, scheduledAt: string, notes?: string): Promise<Booking> {
  const { data } = await apiClient.post("/bookings", { priestId, pujaId, scheduledAt, notes });
  return data;
}

export async function getBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.get(`/bookings/${seg(id)}`);
  return data;
}

export async function rescheduleBooking(id: string, scheduledAt: string): Promise<Booking> {
  const { data } = await apiClient.patch(`/bookings/${seg(id)}/reschedule`, { scheduledAt });
  return data;
}

export async function cancelBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.delete(`/bookings/${seg(id)}`);
  return data;
}

/** Records payment for a confirmed booking (simulated until a payment gateway is integrated). */
export async function payForBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.post(`/bookings/${seg(id)}/pay`);
  return data;
}

// ── Priest Self-Service ──

export async function getPriestProfile(): Promise<Priest> {
  const { data } = await apiClient.get("/admin/priest/profile");
  return data;
}

export async function updatePriestProfile(profileData: Partial<Pick<Priest, "name" | "phone" | "languages" | "bio" | "specialization" | "qualifications" | "experienceYears">> & { pujaIds?: string[] }): Promise<Priest> {
  const { data } = await apiClient.patch("/admin/priest/profile", profileData);
  return data;
}

export async function getPriestStats(): Promise<any> {
  const { data } = await apiClient.get("/admin/priest/stats");
  return data;
}
