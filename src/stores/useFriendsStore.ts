import { create } from "zustand";
import { fetchFriendsList, type Friend } from "@/src/lib/api/friends";

type FriendsState = {
  friends: Friend[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  loadFriends: (opts?: { force?: boolean }) => Promise<void>;
  clearFriends: () => void;
};

const TTL_MS = 5 * 60 * 1000;

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friends: [],
  loading: false,
  error: null,
  lastFetchedAt: null,

  loadFriends: async (opts) => {
    const force = opts?.force ?? false;
    const { loading, lastFetchedAt } = get();
    if (loading) return;

    if (!force && lastFetchedAt && Date.now() - lastFetchedAt < TTL_MS) return;

    set({ loading: true, error: null });
    try {
      const list = await fetchFriendsList();
      set({ friends: list, lastFetchedAt: Date.now() });
    } catch (e: any) {
      set({ error: e?.message ?? "failed to load friends" });
    } finally {
      set({ loading: false });
    }
  },

  clearFriends: () =>
    set({ friends: [], loading: false, error: null, lastFetchedAt: null }),
}));
