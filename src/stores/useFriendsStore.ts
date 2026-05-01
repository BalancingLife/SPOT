import { create } from "zustand";
import { fetchFriendsList, type Friend } from "@/src/lib/api/friends";

type FriendsState = {
  friends: Friend[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;

  loadFriends: (opts?: { force?: boolean }) => Promise<void>;
  upsertFriend: (friend: Friend) => void;
  removeFriend: (friendId: number) => void;
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

  upsertFriend: (friend) =>
    set((state) => {
      const exists = state.friends.some((item) => item.id === friend.id);

      return {
        friends: exists
          ? state.friends.map((item) =>
              item.id === friend.id ? { ...item, ...friend } : item,
            )
          : [friend, ...state.friends],
        lastFetchedAt: Date.now(),
      };
    }),

  removeFriend: (friendId) =>
    set((state) => ({
      friends: state.friends.filter((friend) => friend.id !== friendId),
      lastFetchedAt: Date.now(),
    })),

  clearFriends: () =>
    set({ friends: [], loading: false, error: null, lastFetchedAt: null }),
}));
