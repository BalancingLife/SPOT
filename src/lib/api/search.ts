// src/lib/api/search.ts
import client from "@/src/lib/api/client";
import type { ApiPlace, Place } from "@/src/types/place";
import {
  mapApiPlaceToPlace,
  mapApiPlacesToPlaces,
} from "@/src/lib/mappers/placeMapper";

let inflight: AbortController | null = null;

/** /search/details (장소 목록) */
export async function fetchSearchDetails(params: {
  keyword: string;
  lat: number;
  lng: number;
}): Promise<Place[]> {
  const { keyword, lat, lng } = params;

  if (inflight) inflight.abort();
  inflight = new AbortController();

  const res = await client.get<ApiPlace[]>("/search/details", {
    params: { keyword, lat, lng },
    signal: inflight.signal,
  });

  const raw = Array.isArray(res.data) ? res.data : [];
  return mapApiPlacesToPlaces(raw, {
    currentLat: lat,
    currentLng: lng,
  });
}

let inflightDetail: AbortController | null = null;

/** /search/detail (단일 장소 상세) */
export async function fetchPlaceDetail(params: {
  gid: string;
  lat: number;
  lng: number;
}): Promise<Place> {
  const { gid, lat, lng } = params;

  inflightDetail = new AbortController();

  const res = await client.get<ApiPlace>("/search/detail", {
    params: { gid, lat, lng },
    signal: inflightDetail.signal,
  });

  return mapApiPlaceToPlace(res.data, {
    currentLat: lat,
    currentLng: lng,
    fallbackGid: gid,
  });
}
