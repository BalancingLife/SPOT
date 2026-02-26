import { create } from "zustand";
import type { Place } from "@/src/types/place";
import { fetchHotPlaces } from "@/src/lib/api/places";

type HotPlacesStore = {
  hotList: Place[];
  hotLoading: boolean;
  hotError: string | null;

  setHotList: (items: Place[]) => void;
  setHotLoading: (v: boolean) => void;
  setHotError: (msg: string | null) => void;

  resetHot: () => void;
  refreshHotPlaces: (coords: { lat: number; lng: number }) => Promise<void>;

  // (선택) 북마크 UI 즉시 반영용
  applyHotBookmarkFromPlace: (place: Place, willBookmark: boolean) => void;
};

export const useHotPlacesStore = create<HotPlacesStore>((set) => ({
  hotList: [],
  hotLoading: false,
  hotError: null,

  setHotList: (items) => set({ hotList: items }),
  setHotLoading: (v) => set({ hotLoading: v }),
  setHotError: (msg) => set({ hotError: msg }),

  resetHot: () =>
    set({
      hotList: [],
      hotLoading: false,
      hotError: null,
    }),

  refreshHotPlaces: async ({ lat, lng }) => {
    try {
      set({ hotLoading: true, hotError: null });
      const list = await fetchHotPlaces({ lat, lng });
      set({ hotList: list, hotLoading: false });
    } catch {
      set({
        hotLoading: false,
        hotError: "인기 장소를 불러오는데 실패했습니다.",
      });
    }
  },

  applyHotBookmarkFromPlace: (place, willBookmark) =>
    set((state) => ({
      ...state,
      hotList: state.hotList.map((p) =>
        p.placeId === place.placeId ? { ...p, isBookmarked: willBookmark } : p,
      ),
    })),
}));
