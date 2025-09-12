import client from "@/src/lib/api/client";
import type { Place } from "@/src/stores/useSearchStore";

// 하버사인으로 거리(m) 계산
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // meters
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

let inflight: AbortController | null = null;

export async function fetchSearchDetails(params: {
  keyword: string;
  lat: number;
  lng: number;
}): Promise<Place[]> {
  const { keyword, lat, lng } = params;

  // 이전 요청 있으면 취소
  if (inflight) inflight.abort();
  inflight = new AbortController();

  const res = await client.get("/search/details", {
    params: { keyword, lat, lng },
    signal: inflight.signal,
  });

  const raw: any[] = Array.isArray(res.data) ? res.data : [];
  const items: Place[] = raw.map((it) => {
    const placeLat = Number(it.latitude);
    const placeLng = Number(it.longitude);

    return {
      id: String(it.placeId ?? it.gId ?? ""),
      name: it.name ?? "",
      address: it.address ?? "",
      lat: placeLat,
      lng: placeLng,
      photo: it.photo ?? null,
      ratingAvg: typeof it.ratingAvg === "number" ? it.ratingAvg : null,
      ratingCount: typeof it.ratingCount === "number" ? it.ratingCount : null,
      myRating: typeof it.myRating === "number" ? it.myRating : null,
      savers: Array.isArray(it.savers) ? it.savers : [],
      distanceM:
        isFinite(placeLat) && isFinite(placeLng)
          ? haversine(lat, lng, placeLat, placeLng)
          : undefined,
      thumbnails: it.photo ? [it.photo] : [],
    };
  });

  return items;
}
