import type { ApiSavedPlace, SavedPlace } from "@/src/types/place";

// 혹시 서버 id가 비었을 때만 임시 id 생성 (안전장치)
const makeTempId = (p: ApiSavedPlace, idx: number) =>
  `${p.address || "addr"}_${p.category || "cat"}_${idx}`;

export const mapToSavedPlace = (p: ApiSavedPlace, idx: number): SavedPlace => ({
  id: p.id != null ? String(p.id) : makeTempId(p, idx), // ✅ 서버 id 우선
  title: p.name ?? p.address ?? "이름없음",
  category: p.category ?? "",
  address: p.address ?? "",
  rating: typeof p.rating === "number" ? p.rating : 0,
  images: Array.isArray(p.photos) ? p.photos : [],
  savedCount: Number.isFinite(p.total as number) ? Number(p.total) : 0,
  savedUsers: [],
});
