// src/lib/mappers/placeMapper.ts
import type { ApiPlace, Place } from "@/src/types/place";

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

// 서버 list 코드 → 클라이언트에서 보여줄 카테고리 텍스트
function mapListToCategory(list?: string | null): string | null {
  if (!list) return null;

  // 필요하면 여기서 한글 라벨로 매핑
  switch (list) {
    case "cafe":
      return "카페";
    case "restaurant":
      return "음식점";
    case "bar":
      return "술집";
    default:
      return list; // 모르는 값은 그대로 노출
  }
}

export function mapApiPlaceToPlace(
  it: ApiPlace,
  options: MapOptions = {}
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

  const photo = it.photo ?? it.photoUrl ?? null;

  const thumbnails =
    photo != null
      ? [String(photo)]
      : Array.isArray(it.photos)
      ? it.photos.filter(Boolean).map(String)
      : [];

  return {
    placeId,
    id: String(it.placeId ?? it.gId ?? fallbackGid ?? ""),

    name: it.name ?? "",
    address: it.address ?? "",

    lat,
    lng,

    // 🔥 여기
    category: mapListToCategory(it.list),

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
  options: MapOptions = {}
): Place[] {
  return data.map((it, idx) =>
    mapApiPlaceToPlace(it, {
      ...options,
      fallbackGid: options.fallbackGid ?? String(idx),
    })
  );
}
