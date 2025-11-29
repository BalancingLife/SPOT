// src/lib/api/places.ts
import client from "@/src/lib/api/client";
import type { ApiPlace, Place } from "@/src/types/place";
import { mapApiPlacesToPlaces } from "@/src/lib/mappers/placeMapper";

/** /new 저장한 장소 최신순 */
export async function fetchMyNewSavedPlaces(params: {
  lat: number;
  lng: number;
}): Promise<Place[]> {
  const { lat, lng } = params;

  const res = await client.get<ApiPlace[]>("/new", {
    params: { lat, lng },
  });

  console.log("/new api 요청 결과", res.data);

  return mapApiPlacesToPlaces(res.data, {
    currentLat: lat,
    currentLng: lng,
  });
}
