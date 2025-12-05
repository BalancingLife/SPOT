// src/lib/api/places.ts
import client from "@/src/lib/api/client";
import type { ApiPlace, Place } from "@/src/types/place";
import { mapApiPlacesToPlaces } from "@/src/lib/mappers/placeMapper";

export async function fetchMapPlaces(params: {
  latitude: number;
  longitude: number;
  radius?: number; // 안 넘기면 백엔드 기본값 1000
}): Promise<Place[]> {
  const { latitude, longitude, radius } = params;

  const res = await client.get<ApiPlace[]>("/main/map", {
    params: {
      latitude,
      longitude,
      radius, // 필요 없으면 생략 가능
    },
  });

  return mapApiPlacesToPlaces(res.data, {
    currentLat: latitude,
    currentLng: longitude,
  });
}

/** /new 저장한 장소 최신순 */
export async function fetchMyNewSavedPlaces(params: {
  lat: number;
  lng: number;
}): Promise<Place[]> {
  const { lat, lng } = params;

  const res = await client.get<ApiPlace[]>("/new", {
    params: { lat, lng },
  });
  console.log("/new api 호출 결과 : ", res.data);

  return mapApiPlacesToPlaces(res.data, {
    currentLat: lat,
    currentLng: lng,
  });
}

/** /distance 거리순 */
export async function fetchPlacesByDistance(params: {
  lat: number;
  lng: number;
}): Promise<Place[]> {
  const { lat, lng } = params;

  try {
    const res = await client.get<ApiPlace[]>("/distance", {
      params: { lat, lng },
    });

    console.log("[/distance] ", res.data);

    return mapApiPlacesToPlaces(res.data, {
      currentLat: lat,
      currentLng: lng,
    });
  } catch (err: any) {
    console.error("[/distance] ERROR", {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err; // 위로 다시 던져서 SavedPlacesTab의 try/catch로 올라가게
  }
}
