import { create } from "zustand";
import type { Place } from "@/src/types/place";
import { toggleBookmarkApi } from "@/src/lib/api/bookmark";
import { useSavedPlacesStore } from "@/src/stores/useSavedPlacesStore";

export type Saver = {
  nickname: string;
  profileImageUrl: string;
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
  toggleBookmark: (placeId: number | null) => Promise<void> | void;
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

    console.log("[bookmark] called with", {
      placeId,
      itemsLen: items.length,
      hasFocused: !!focused,
    });

    if (placeId == null) {
      console.warn("[bookmark] placeId is null, cannot call API");
      return;
    }

    const prevItems = items;
    const prevFocused = focused;

    const targetInList = items.find((p) => p.placeId === placeId);
    const targetInFocused =
      !targetInList && focused?.placeId === placeId ? focused : null;

    const target = targetInList ?? targetInFocused;

    if (!target) {
      console.warn(
        "[searchStore] target not found in items/focused. ignore in search context."
      );
      return;
    }

    const willBookmark = !target.isBookmarked;

    // 1) 낙관적 업데이트
    set((state) => ({
      ...state,
      items: state.items.map((p) =>
        p.placeId === placeId ? { ...p, isBookmarked: willBookmark } : p
      ),
      focused:
        state.focused && state.focused.placeId === placeId
          ? { ...state.focused, isBookmarked: willBookmark }
          : state.focused,
    }));

    // 2) API 호출
    try {
      await toggleBookmarkApi(placeId, willBookmark);

      // SavedPlacesStore에도 반영
      const { applyBookmarkFromPlace } = useSavedPlacesStore.getState();
      applyBookmarkFromPlace(target, willBookmark);

      console.log("[searchStore] toggleBookmark success", {
        placeId,
        willBookmark,
      });
    } catch (err) {
      console.error("[searchStore] toggleBookmark failed", err);
      // 3) 실패 시 롤백
      set({ items: prevItems, focused: prevFocused });
    }
  },
}));
