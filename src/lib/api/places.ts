import client from "./client";
import type { ApiSavedPlace, SavedPlace } from "@/src/types/place";
import { mapToSavedPlace } from "@/src/lib/mappers/placeMapper";

/**
 * /my 조회
 * 예: GET /my?sort=distance&lat=37.125&lng=126.1234&userId=40
 * 서버는 배열을 바로 반환함 (status 200, body: ApiSavedPlace[])
 */
export async function fetchMySavedPlaces(params: {
  lat: number;
  lng: number;
  userId: number;
  sort?: "distance" | "latest";
}): Promise<SavedPlace[]> {
  const { lat, lng, userId, sort = "distance" } = params;

  const { data } = await client.get<ApiSavedPlace[]>("/my", {
    params: { sort, lat, lng, userId },
  });

  // index는 임시 id fallback 용으로만 사용
  return data.map((item, idx) => mapToSavedPlace(item, idx));
}
