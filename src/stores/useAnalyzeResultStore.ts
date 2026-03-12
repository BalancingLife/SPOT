// src/stores/useAnalyzeResultStore.ts
import { create } from "zustand";
import type { SavePlaceItem } from "@/src/components/bottomSheet/SavePlacesBottomSheet";

type AnalyzeMeta = {
  sourceUrl?: string;
  receivedAt?: number;
};

type AnalyzeResultStore = {
  visible: boolean;
  places: SavePlaceItem[];
  meta: AnalyzeMeta;

  openWithPlaces: (places: SavePlaceItem[], meta?: AnalyzeMeta) => void;
  close: () => void;
  clear: () => void;
};

export const useAnalyzeResultStore = create<AnalyzeResultStore>((set, get) => ({
  visible: false,
  places: [],
  meta: {},

  openWithPlaces: (places, meta) => {
    console.log("[analyze-store] openWithPlaces", places);
    set({
      visible: true,
      places,
      meta: { receivedAt: Date.now(), ...(meta ?? {}) },
    });
  },

  close: () => {
    const state = get();
    if (!state.visible) return;

    console.log("[analyze-store] close");
    set({ visible: false });
  },

  clear: () => {
    const state = get();
    if (!state.visible && state.places.length === 0) return;

    console.log("[analyze-store] clear");
    set({ visible: false, places: [], meta: {} });
  },
}));
