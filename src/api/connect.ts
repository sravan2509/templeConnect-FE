import { apiClient } from "./client";

export interface Priest {
  id: string;
  name: string;
  specialization: string[];
  languages: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  experienceYears: number;
  qualifications: string[];
  bio?: string;
  avatar?: string;
  services?: PriestService[];
}

export interface PriestService {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMins: number;
}

export interface PriestReview {
  id: string;
  rating: number;
  comment?: string;
  user?: { name: string };
  createdAt: string;
}

export interface Booking {
  id: string;
  priestId: string;
  serviceId: string;
  scheduledAt: string;
  status: string;
  paid: boolean;
  amount: number;
  notes?: string;
  priest?: { name: string };
  service?: { name: string; price: number };
}

export async function listPriests(): Promise<Priest[]> {
  const { data } = await apiClient.get("/priests");
  return data;
}

export async function getPriest(id: string): Promise<Priest> {
  const { data } = await apiClient.get(`/priests/${id}`);
  return data;
}

export async function getPriestReviews(priestId: string): Promise<PriestReview[]> {
  const { data } = await apiClient.get(`/priests/${priestId}/reviews`);
  return data;
}

export async function getPriestServices(priestId: string): Promise<PriestService[]> {
  const { data } = await apiClient.get(`/priests/${priestId}/services`);
  return data;
}

export async function getPriestAvailability(priestId: string): Promise<any[]> {
  const { data } = await apiClient.get(`/priests/${priestId}/availability`);
  return data;
}

export async function listBookings(status?: string): Promise<Booking[]> {
  const { data } = await apiClient.get("/bookings", { params: status ? { status } : {} });
  return data;
}

export async function createBooking(
  priestId: string,
  serviceId: string,
  scheduledAt: string,
  notes?: string
): Promise<Booking> {
  const { data } = await apiClient.post("/bookings", { priestId, serviceId, scheduledAt, notes });
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

export async function payForBooking(id: string): Promise<Booking> {
  const { data } = await apiClient.post(`/bookings/${id}/pay`);
  return data;
}
