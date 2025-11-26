import { create } from "zustand";
import client from "@/src/lib/api/client";

export type Saver = {
  nickname: string;
  profileImageUrl: string;
};

export type Place = {
  placeId: number | null; //  서버 place PK, 없을 수도 있어서 null 허용
  id: string; //  네이버/구글 place id (문자열)
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
  toggleBookmark: (placeId: number | null) => Promise<void>;
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

  // ✅ 북마크 토글
  toggleBookmark: async (placeId) => {
    const { items, focused } = get();

    // 0) placeId 없으면 아예 호출하지 않음
    if (placeId == null) {
      console.warn("[bookmark] placeId is null, cannot call API");
      return;
    }

    // 0-1) 이전 상태 저장 (롤백용)
    const prevItems = items;
    const prevFocused = focused;

    // 🔍 대상 찾기: 이제는 placeId로 찾는다
    const target =
      items.find((p) => p.placeId === placeId) ??
      (focused && focused.placeId === placeId ? focused : null);

    if (!target) return;

    const willBookmark = !target.isBookmarked;

    // 1) 낙관적 업데이트
    const updatedItems = items.map((p) =>
      p.placeId === placeId ? { ...p, isBookmarked: willBookmark } : p
    );
    const updatedFocused =
      focused && focused.placeId === placeId
        ? { ...focused, isBookmarked: willBookmark }
        : focused;

    set({ items: updatedItems, focused: updatedFocused });

    try {
      // 숫자는 encode 안 해도 되지만, 습관적으로 감싸도 문제 없음
      // const encodedId = encodeURIComponent(String(placeId));

      if (willBookmark) {
        // 🔸 북마크 등록
        await client.post(`/main/map/bookmark/${placeId}`);
        console.log("bookmark placeId:", placeId);
      } else {
        // 🔸 북마크 해제 (엔드포인트 정확한 건 BE한테 확인 필요)
        await client.delete(`/main/${placeId}`);
      }
    } catch (err) {
      console.error("toggleBookmark error:", err);

      // 2) 실패 시 롤백
      set({ items: prevItems, focused: prevFocused });
    }
  },
}));
