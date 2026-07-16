import { apiClient, MOCK_API } from "./client";

export interface TempleResult {
  name: string;
  rating: number | null;
  address: string | null;
  placeId: string;
  location: { lat: number; lon: number } | null;
}

// TODO(revert): delete this mock block
const MOCK_TEMPLE_RESULTS: TempleResult[] = [
  { name: "ISKCON Temple", rating: 4.8, address: "Mock Address, Mock City", placeId: "mock-place-1", location: { lat: 17.385, lon: 78.4867 } },
  { name: "Sri Venkateswara Temple", rating: 4.6, address: "Mock Address 2, Mock City", placeId: "mock-place-2", location: { lat: 17.4, lon: 78.48 } },
];

export async function searchTemples(query: string): Promise<TempleResult[]> {
  if (MOCK_API) return MOCK_TEMPLE_RESULTS; // TODO(revert)
  const { data } = await apiClient.get("/locations/temples", { params: { query } });
  return data;
}
