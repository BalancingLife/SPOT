import { api8080 } from "./client";

// lib/api/bookmark.ts
export async function toggleBookmarkApi(placeId: number) {
  return api8080.post(`${placeId}/toggle`);
}
