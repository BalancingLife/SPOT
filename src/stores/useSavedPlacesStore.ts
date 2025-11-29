// src/stores/useSavedPlacesStore.ts
import { create } from "zustand";
import type { Place } from "@/src/types/place";

type SavedPlacesStore = {
  savedList: Place[];
  savedLoading: boolean;
  savedError: string | null;

  setSavedList: (items: Place[]) => void;
  setSavedLoading: (v: boolean) => void;
  setSavedError: (msg: string | null) => void;
  resetSaved: () => void;
};

export const useSavedPlacesStore = create<SavedPlacesStore>((set) => ({
  savedList: [],
  savedLoading: false,
  savedError: null,

  setSavedList: (items) => set({ savedList: items }),
  setSavedLoading: (v) => set({ savedLoading: v }),
  setSavedError: (msg) => set({ savedError: msg }),

  resetSaved: () =>
    set({
      savedList: [],
      savedLoading: false,
      savedError: null,
    }),
}));
