import { apiClient } from "./client";

export interface BirthChart {
  id: string;
  dob: string;
  time: string;
  placeName: string;
  lat: number;
  lon: number;
  nakshatra: string | null;
  rashi: string | null;
}

export interface RashiData {
  name: string;
  englishName: string;
  rulingPlanet: string;
  element: string;
  quality: string;
  deities: string[];
}

export interface NakshatraData {
  name: string;
  pada: number;
  presidingDeity: string;
  rulingPlanet: string;
  templeDeity: string;
  qualities: string;
}

export interface DeityRecommendation {
  primaryDeity: string;
  nakshatraDeity: string;
  rashiDeities: string[];
  description: string;
  searchKeywords: string[];
}

export interface AstroProfile {
  birthDetails: {
    date: string;
    time: string;
    place: string;
    lat: number;
    lng: number;
  };
  rashi: RashiData;
  nakshatra: NakshatraData;
  moonLongitude: {
    tropical: number;
    sidereal: number;
    ayanamsa: number;
  };
  deityRecommendation: DeityRecommendation;
}

export interface CompleteRecommendation {
  success: boolean;
  data: AstroProfile & {
    nearestTemples?: any[];
  };
}

export async function submitBirthChart(
  dob: string,
  time: string,
  place: string,
  lat?: number,
  lng?: number
): Promise<BirthChart & { profile: AstroProfile; deityRecommendation: DeityRecommendation }> {
  const { data } = await apiClient.post("/astrology/birth-chart", { dob, time, place, lat, lng });
  return data;
}

export async function getBirthChart(): Promise<BirthChart | null> {
  const { data } = await apiClient.get("/astrology/birth-chart");
  return data;
}

export async function getAstroProfile(): Promise<AstroProfile> {
  const { data } = await apiClient.get("/astrology/astro-profile");
  return data;
}

export async function getForecast(): Promise<{ rashi: string | null; forecast: string }> {
  const { data } = await apiClient.get("/astrology/forecast");
  return data;
}

export async function getRecommendations(): Promise<{ rashi: string | null; recommendations: string[] }> {
  const { data } = await apiClient.get("/astrology/recommendations");
  return data;
}

export async function getCompleteRecommendation(input: {
  birthDate: string;
  birthTime: string;
  birthLocationName: string;
  birthLat: number;
  birthLng: number;
}): Promise<CompleteRecommendation> {
  const { data } = await apiClient.post("/astrology/complete-recommendation", input);
  return data;
}
