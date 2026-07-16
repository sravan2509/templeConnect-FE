import { apiClient, MOCK_API } from "./client";

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

// TODO(revert): delete this mock block
const MOCK_BIRTH_CHART: BirthChart = {
  id: "mock-chart-id",
  dob: "1995-08-15",
  time: "14:30",
  placeName: "Hyderabad, India",
  lat: 17.385,
  lon: 78.4867,
  nakshatra: "Rohini",
  rashi: "Vrishabha",
};

export async function submitBirthChart(dob: string, time: string, place: string): Promise<BirthChart> {
  if (MOCK_API) return { ...MOCK_BIRTH_CHART, dob, time, placeName: place }; // TODO(revert)
  const { data } = await apiClient.post("/astrology/birth-chart", { dob, time, place });
  return data;
}

export async function getBirthChart(): Promise<BirthChart | null> {
  if (MOCK_API) return MOCK_BIRTH_CHART; // TODO(revert)
  const { data } = await apiClient.get("/astrology/birth-chart");
  return data;
}
