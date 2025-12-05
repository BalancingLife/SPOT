import client from "./client";

// lib/api/bookmark.ts
export async function toggleBookmarkApi(
  placeId: number,
  willBookmark: boolean
) {
  if (willBookmark) {
    // 북마크 등록
    return client.post(`/main/map/bookmark/${placeId}`);
  } else {
    // 북마크 삭제
    return client.post(`/main/map/bookmark/${placeId}`);
  }
}
