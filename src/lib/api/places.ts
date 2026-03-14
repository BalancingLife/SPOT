import { api8080, api8001 } from "@/src/lib/api/client";
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

  const res = await api8080.get<ApiMapPlace[]>("/main/map", {
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

  const res = await api8080.get<ApiPlace[]>("/new", {
    params: { lat, lng },
  });

  return mapApiPlacesToPlaces(res.data, {
    currentLat: lat,
    currentLng: lng,
  });
}

/** /popular 인기 장소 */
export async function fetchHotPlaces(params: {
  lat: number;
  lng: number;
}): Promise<Place[]> {
  const { lat, lng } = params;

  const res = await api8080.get<ApiPlace[]>("/popular", {
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
    const res = await api8080.get<ApiPlace[]>("/distance", {
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
    throw err;
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
    const res = await api8080.get<ApiPlaceMoreResponse>("/more", {
      params: { lat, lng, placeId },
    });
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

/** 8001 /places/ 장소 저장 */
export async function savePlaces(params: {
  placeIds: number[];
  saveType?: "instagram";
}): Promise<void> {
  const { placeIds, saveType = "instagram" } = params;

  try {
    await api8001.post("/places/", {
      place_ids: placeIds,
      save_type: saveType,
    });
  } catch (err: any) {
    console.error("[POST /places/] ERROR", {
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
    });
    throw err;
  }
}
