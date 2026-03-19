// src/stores/usePlaceMoreStore.ts
import { create } from "zustand";
import type { Place } from "@/src/types/place";

type State = {
  basePlace: Place | null;
  setBasePlace: (place: Place | null) => void;
  syncBookmarkByPlaceId: (placeId: number, nextBookmarked: boolean) => void;
};

export const usePlaceMoreStore = create<State>((set) => ({
  basePlace: null,
  setBasePlace: (place) => set({ basePlace: place }),

  syncBookmarkByPlaceId: (placeId, nextBookmarked) =>
    set((state) => ({
      basePlace:
        state.basePlace && state.basePlace.placeId === placeId
          ? { ...state.basePlace, isBookmarked: nextBookmarked }
          : state.basePlace,
    })),
}));
