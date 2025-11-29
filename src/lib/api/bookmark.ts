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
    // 북마크 삭제 (이 URL은 BE랑 맞춰봐야 함)
    return client.delete(`/main/${placeId}`);
  }
}
