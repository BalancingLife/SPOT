import { create } from "zustand";
// import client from "@/src/lib/api/client";

export type Saver = {
  nickname: string;
  profileImageUrl: string;
};

export type Place = {
  placeId: number; // 서버용
  id: string; // placeId 또는 gId
  name: string;
  address?: string;
  lat: number;
  lng: number;

  // 응답 기반 필드
  photo?: string; // 대표 이미지 1장
  ratingAvg?: number | null;
  ratingCount?: number | null;
  myRating?: number | null;
  savers?: Saver[]; // 저장한 사람들(아바타용)

  // 클라이언트 계산/표시용
  distanceM?: number; // 하버사인 계산
  thumbnails?: string[]; // UI 호환(= [photo])
  categoryPath?: string[]; // 응답엔 list(string)만 있으므로 필요시 파싱
  isBookmarked?: boolean; // 서버 스키마엔 없음 → 필요 시 별도 API로 동기화
};

type Phase = "idle" | "loading" | "success" | "empty" | "error";

type State = {
  query: string | null;
  phase: Phase;
  items: Place[];
  error: string | null;

  // 상세 모드: 결과 리스트 중 하나를 눌렀을 때
  focused: Place | null;

  // ✅ 상세 API 호출 트리거(홈에서 감지)
  pendingDetailGid: string | null;

  // 액션들
  submit: (keyword: string) => void; // 검색 시작 신호
  setLoading: () => void;
  setResult: (items: Place[]) => void;
  setError: (msg: string) => void;
  reset: () => void;

  focus: (place: Place) => void;
  unfocus: () => void;

  // ✅ 상세 요청 신호 관리
  requestDetail: (gid: string) => void;
  clearPendingDetail: () => void;

  // 🔹 북마크 토글 액션
  // toggleBookmark: (placeId: string) => Promise<void>;
};

export const useSearchStore = create<State>((set, get) => ({
  query: null,
  phase: "idle",
  items: [],
  error: null,
  focused: null,

  // ✅ 상세 요청 초기값
  pendingDetailGid: null,

  submit: (keyword) =>
    set({
      query: keyword.trim(),
      phase: "loading",
      error: null,
      items: [],
      focused: null,
    }),
  setLoading: () => set({ phase: "loading", error: null }),
  setResult: (items) =>
    set({ items, phase: items.length ? "success" : "empty", error: null }),
  setError: (msg) => set({ phase: "error", error: msg }),
  reset: () =>
    set({
      query: null,
      phase: "idle",
      items: [],
      error: null,
      focused: null,
      pendingDetailGid: null,
    }),

  focus: (place) => set({ focused: place }),
  unfocus: () => set({ focused: null }),

  // ✅ 상세 요청 신호
  requestDetail: (gid) => set({ pendingDetailGid: gid }),
  clearPendingDetail: () => set({ pendingDetailGid: null }),
}));
