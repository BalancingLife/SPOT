import { api8080 } from "./client";

// lib/api/bookmark.ts
export async function toggleBookmarkApi(
  placeId: number,
  willBookmark: boolean
) {
  if (willBookmark) {
    // 북마크 등록
    return api8080.post(`${placeId}/toggle`);
  } else {
    // 북마크 삭제
    return api8080.post(`${placeId}/toggle`);
  }
}
