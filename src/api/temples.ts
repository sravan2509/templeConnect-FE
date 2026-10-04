import { apiClient, seg } from "./client";

export interface TempleResult {
  name: string;
  rating: number | null;
  address: string | null;
  placeId: string;
  location: { lat: number; lon: number } | null;
  distanceKm?: number;
  city?: string;
  state?: string;
  deity?: string | null;
  curated?: boolean;
}

export interface TempleEvent {
  id: string;
  name: string;
  description: string | null;
  date: string;
  time: string | null;
}

export interface TemplePuja {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  time: string | null;
}

/** Only real data — unknown fields are null and should be hidden. */
export interface TempleDetail {
  placeId: string;
  name: string;
  deity: string | null;
  history: string | null;
  significance: string | null;
  sevas: string | null;
  contactDetails: string | null;
  websiteLink: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  lat: number | null;
  lon: number | null;
  rating: number | null;
  openingHours: string[] | null;
  openNow: boolean | null;
  events: TempleEvent[];
  pujas: TemplePuja[];
  verified: boolean;
  source: "db" | "google" | "famous";
}

export interface NearbyEvent extends TempleEvent {
  distanceKm: number;
  temple: { name: string; placeId: string; city: string | null; state: string | null; lat: number | null; lon: number | null };
}

export async function searchTemples(query: string): Promise<TempleResult[]> {
  const { data } = await apiClient.get("/locations/temples", { params: { query } });
  return data;
}

export async function getTemplesNearby(lat: number, lng: number, deity?: string, radiusKm?: number): Promise<{ success: boolean; data: TempleResult[] }> {
  const { data } = await apiClient.get("/temples/nearby", { params: { lat, lng, deity, radiusKm } });
  return data;
}

export async function getNearbyEvents(lat: number, lng: number, radiusKm = 150): Promise<NearbyEvent[]> {
  const { data } = await apiClient.get("/home/nearby-events", { params: { lat, lng, radiusKm } });
  return data;
}

export async function getTempleDetail(placeId: string): Promise<TempleDetail> {
  const { data } = await apiClient.get(`/temples/${seg(placeId)}`);
  return data;
}

export async function getIndianStates(): Promise<{ success: boolean; data: string[] }> {
  const { data } = await apiClient.get("/locations/states");
  return data;
}

export async function getDistricts(state: string): Promise<{ success: boolean; data: string[] }> {
  const { data } = await apiClient.get("/locations/districts", { params: { state } });
  return data;
}
