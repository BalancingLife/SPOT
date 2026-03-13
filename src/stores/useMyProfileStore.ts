import { create } from "zustand";

import {
  getMyProfile,
  type MyProfile,
  type MyProfileBundle,
} from "@/src/lib/api/profile";

type MyProfileState = {
  profile: MyProfile | null;
  friendCount: number;
  recentFriendPhotos: string[];
  loading: boolean;

  setMyProfile: (data: MyProfileBundle | null) => void;
  fetchMyProfile: () => Promise<void>;
  clearMyProfile: () => void;
};

export const useMyProfileStore = create<MyProfileState>((set) => ({
  profile: null,
  friendCount: 0,
  recentFriendPhotos: [],
  loading: false,

  setMyProfile: (data) => {
    if (!data) {
      set({
        profile: null,
        friendCount: 0,
        recentFriendPhotos: [],
      });
      return;
    }

    set({
      profile: data.profile,
      friendCount: data.friendCount,
      recentFriendPhotos: data.recentFriendPhotos,
    });
  },

  fetchMyProfile: async () => {
    set({ loading: true });

    try {
      const data = await getMyProfile();

      if (!data) {
        set({
          profile: null,
          friendCount: 0,
          recentFriendPhotos: [],
          loading: false,
        });
        return;
      }

      set({
        profile: data.profile,
        friendCount: data.friendCount,
        recentFriendPhotos: data.recentFriendPhotos,
        loading: false,
      });
    } catch {
      set({
        profile: null,
        friendCount: 0,
        recentFriendPhotos: [],
        loading: false,
      });
    }
  },

  clearMyProfile: () => {
    set({
      profile: null,
      friendCount: 0,
      recentFriendPhotos: [],
      loading: false,
    });
  },
}));
