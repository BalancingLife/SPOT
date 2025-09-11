// src/stores/useAuthStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
  token: string | null;
  email: string | null;
  nickname: string | null;
  setAuth: (p: {
    token: string;
    email?: string;
    nickname?: string;
  }) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>; // 앱 시작 시 복구
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  email: null,
  nickname: null,

  setAuth: async ({ token, email, nickname }) => {
    await AsyncStorage.setItem(
      "auth",
      JSON.stringify({ token, email, nickname })
    );
    set({ token, email: email ?? null, nickname: nickname ?? null });
  },

  clearAuth: async () => {
    await AsyncStorage.removeItem("auth");
    set({ token: null, email: null, nickname: null });
  },

  hydrate: async () => {
    const raw = await AsyncStorage.getItem("auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      set({
        token: parsed.token ?? null,
        email: parsed.email ?? null,
        nickname: parsed.nickname ?? null,
      });
    }
  },
}));
