import { apiClient } from "./client";

export interface TempleResult {
  name: string;
  rating: number | null;
  address: string | null;
  placeId: string;
  location: { lat: number; lon: number } | null;
  distanceKm?: number;
  city?: string;
  state?: string;
}

export interface TempleSearchByDeityInput {
  deity: string;
  searchState: string;
  searchDistrict?: string;
  searchMandal?: string;
}

export interface TempleDetail {
  placeId: string;
  deity: string;
  builtCentury: string;
  history: string;
  speciality: string;
  timings: {
    placeId: string;
    openTime: string;
    closeTime: string;
    dailySevas: { name: string; time: string }[];
  };
  events: { id: string; placeId: string; name: string; date: string }[];
}

export interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
}

export async function searchTemples(query: string): Promise<TempleResult[]> {
  const { data } = await apiClient.get("/locations/temples", { params: { query } });
  return data;
}

export async function searchTemplesByDeity(input: TempleSearchByDeityInput): Promise<{ success: boolean; data: TempleResult[] }> {
  const { data } = await apiClient.post("/temples/search-by-deity", input);
  return data;
}

export async function getTemplesNearby(lat: number, lng: number, deity?: string, radiusKm?: number): Promise<{ success: boolean; data: TempleResult[] }> {
  const { data } = await apiClient.get("/temples/nearby", { params: { lat, lng, deity, radiusKm } });
  return data;
}

export async function getTempleDetail(placeId: string): Promise<TempleDetail> {
  const { data } = await apiClient.get(`/temples/${placeId}`);
  return data;
}

export async function getTempleTimings(placeId: string): Promise<any> {
  const { data } = await apiClient.get(`/temples/${placeId}/timings`);
  return data;
}

export async function getTempleEvents(placeId: string): Promise<any[]> {
  const { data } = await apiClient.get(`/temples/${placeId}/events`);
  return data;
}

export async function getTempleHistory(placeId: string): Promise<any> {
  const { data } = await apiClient.get(`/temples/${placeId}/history`);
  return data;
}

export async function geocodePlace(place: string): Promise<GeocodeResult> {
  const { data } = await apiClient.get("/locations/geocode", { params: { place } });
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

export async function getMandals(state: string, district: string): Promise<{ success: boolean; data: string[] }> {
  const { data } = await apiClient.get("/locations/mandals", { params: { state, district } });
  return data;
}

export async function setReminder(placeId: string): Promise<any> {
  const { data } = await apiClient.post(`/temples/${placeId}/reminders`);
  return data;
}

export async function removeReminder(placeId: string, reminderId: string): Promise<void> {
  await apiClient.delete(`/temples/${placeId}/reminders/${reminderId}`);
}

export interface TempleEventsAndPujas {
  source: "db" | "api";
  events: Array<{
    id: string;
    name: string;
    description: string | null;
    date: string;
    time: string | null;
  }>;
  pujas: Array<{
    id: string;
    name: string;
    description: string | null;
    schedule: string | null;
    time: string | null;
  }>;
  message?: string;
}

export async function getTempleEventsAndPujas(placeId: string): Promise<TempleEventsAndPujas> {
  const { data } = await apiClient.get(`/temples/${placeId}/events`);
  return data;
}

