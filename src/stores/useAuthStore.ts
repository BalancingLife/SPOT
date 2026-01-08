// src/stores/useAuthStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthState = {
  token: string | null;
  email: string | null;
  nickname: string | null;

  hasHydrated: boolean;

  setAuth: (p: {
    token: string;
    email?: string;
    nickname?: string;
  }) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  email: null,
  nickname: null,

  hasHydrated: false,

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
    try {
      const raw = await AsyncStorage.getItem("auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          token: parsed.token ?? null,
          email: parsed.email ?? null,
          nickname: parsed.nickname ?? null,
        });
      }
    } finally {
      // 무조건 끝 표시
      set({ hasHydrated: true });
    }
  },
}));
