// src/lib/api/places.ts
import client from "@/src/lib/api/client";
import type {
  ApiPlace,
  ApiMapPlace,
  Place,
  ApiPlaceMoreResponse,
} from "@/src/types/place";
import { mapApiPlacesToPlaces } from "@/src/lib/mappers/placeMapper";

export async function fetchMapPlaces(params: {
  latitude: number;
  longitude: number;
  radius?: number;
}): Promise<ApiMapPlace[]> {
  const { latitude, longitude, radius } = params;

  const res = await client.get<ApiMapPlace[]>("/main/map", {
    params: { latitude, longitude, radius },
  });

  return res.data;
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

/** /more API */
export async function fetchPlaceMore(params: {
  lat: number;
  lng: number;
  placeId: number;
}): Promise<ApiPlaceMoreResponse> {
  const { lat, lng, placeId } = params;

  try {
    const res = await client.get<ApiPlaceMoreResponse>("/more", {
      params: { lat, lng, placeId },
    });
    console.log("final url:", res.request?.responseURL);
    console.log("[/more] api res.data:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("[/more] ERROR", {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
}
