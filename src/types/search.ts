// src/types/search.ts
export type SearchPayload = {
  keyword: string;
  lat: number | null;
  lng: number | null;
};

/** /search API 응답 = UI 사용 형태 */
export type SearchItem = {
  name: string;
  address: string;
  gid: string;
  photoUrl: string | null;
  list: string;
  distance: number;
  latitude: number;
  longitude: number;
};
