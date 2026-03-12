// src/stores/useLocationStore.ts
import { create } from "zustand";
import * as Location from "expo-location";

type Coords = {
  lat: number;
  lng: number;
};
type Permission = "unknown" | "granted" | "denied";

type LocationState = {
  coords: Coords | null;
  permission: Permission;
  setCoords: (c: Coords) => void;
  setPermission: (p: Permission) => void;

  /** 권한 요청 (이미 결정된 상태면 스킵) */
  ensurePermission: () => Promise<Permission>;
  /** 현재 좌표 한 번 가져와 갱신 */
  refreshOnce: () => Promise<void>;
};

export const useLocationStore = create<LocationState>((set, get) => ({
  coords: null,
  permission: "unknown",

  setCoords: (c) => set({ coords: c }),
  setPermission: (p) => set({ permission: p }),

  ensurePermission: async () => {
    const { permission } = get();
    if (permission !== "unknown") return permission;

    const { status } = await Location.requestForegroundPermissionsAsync();
    const next: Permission = status === "granted" ? "granted" : "denied";
    set({ permission: next });
    return next;
  },

  // 현재 위치 가져와서 lat,lng에 저장하기
  refreshOnce: async () => {
    const p = await get().ensurePermission();
    if (p !== "granted") return;

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    set({
      coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
    });
  },
}));
