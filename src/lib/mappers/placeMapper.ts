// src/lib/mappers/placeMapper.ts
import type { ApiPlace, Place } from "@/src/types/place";
import { getCategoryLabel } from "@/src/utils/categoryLabel";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

type MapOptions = {
  currentLat?: number;
  currentLng?: number;
  fallbackGid?: string;
};

export function mapApiPlaceToPlace(
  it: ApiPlace,
  options: MapOptions = {},
): Place {
  const { currentLat, currentLng, fallbackGid } = options;

  const lat = Number(it.latitude);
  const lng = Number(it.longitude);

  const distanceM =
    currentLat != null && currentLng != null && isFinite(lat) && isFinite(lng)
      ? haversine(currentLat, currentLng, lat, lng)
      : undefined;

  const placeId =
    typeof it.placeId === "number" && Number.isFinite(it.placeId)
      ? it.placeId
      : null;

  const anyIt = it as any;
  const photo = it.photo ?? anyIt.photoUrl ?? null;

  const thumbnails =
    photo != null
      ? [String(photo)]
      : Array.isArray(anyIt.photos)
        ? anyIt.photos.filter(Boolean).map(String)
        : [];

  const categoryKey = (it as any).list ?? null; // ✅ 원본 키 보존 ("cafe", "restaurant"...)

  return {
    placeId,
    id: String(it.placeId ?? it.gId ?? fallbackGid ?? ""),

    name: it.name ?? "",
    address: it.address ?? "",

    lat,
    lng,

    // ✅ 필터용 키 + 표시용 라벨을 분리
    categoryKey,
    category: getCategoryLabel(categoryKey) || null,

    photo,
    thumbnails,

    ratingAvg: typeof it.ratingAvg === "number" ? it.ratingAvg : null,
    ratingCount: typeof it.ratingCount === "number" ? it.ratingCount : null,
    myRating: typeof it.myRating === "number" ? it.myRating : null,

    savers: Array.isArray(it.savers) ? it.savers : [],
    distanceM,

    isBookmarked: !!it.isMarked,
  };
}

export function mapApiPlacesToPlaces(
  data: ApiPlace[],
  options: MapOptions = {},
): Place[] {
  return data.map((it, idx) =>
    mapApiPlaceToPlace(it, {
      ...options,
      fallbackGid: options.fallbackGid ?? String(idx),
    }),
  );
}
