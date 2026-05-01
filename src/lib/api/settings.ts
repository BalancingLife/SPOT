// src/lib/api/settings.ts
import { api8000 } from "@/src/lib/api/client";
import type { ApiEnvelope } from "@/src/lib/api/common";

// ============
// Logout
// POST /settings/logout
// ============
export type LogoutResponse = ApiEnvelope<{
  message: string;
}>;

export async function logout(): Promise<boolean> {
  try {
    await api8000.post<LogoutResponse>("/settings/logout");
    return true;
  } catch {
    return false;
  }
}

// ============
// Delete Account
// POST /settings/delete-account
// ============
export type DeleteAccountResponse = ApiEnvelope<{
  message: string;
}>;

export async function deleteAccount(): Promise<boolean> {
  try {
    await api8000.post<DeleteAccountResponse>("/settings/delete-account");
    return true;
  } catch {
    return false;
  }
}

// ============
// Block List
// GET /settings/blocklist
// ============
export type ApiBlockItem = {
  id: number;
  member_id: number;
  friend_id: number;
  status: string;
  updated_at: string; // ISO
  spot_id: string;
  spot_nickname: string;
  one_line: string | null;
  photo: string | null;
};

export type BlockListResponse = ApiEnvelope<{
  total: number;
  blocks: ApiBlockItem[];
}>;

export type BlockItem = {
  id: number;
  memberId: number;
  friendId: number;
  status: string;
  updatedAt: string;
  userId: string;
  nickname: string;
  oneLine: string | null;
  photo: string | null;
};

const normalizeProfilePhoto = (photo: string | null) => {
  if (!photo) return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL_8000 ?? "";
  return `${baseUrl}${photo}`;
};

export async function fetchBlockList(): Promise<{
  total: number;
  blocks: BlockItem[];
}> {
  const res = await api8000.get<BlockListResponse>("/settings/blocklist");
  const raw = Array.isArray(res.data?.data?.blocks) ? res.data.data.blocks : [];

  return {
    total: Number(res.data?.data?.total ?? raw.length),
    blocks: raw.map((b) => ({
      id: b.id,
      memberId: b.member_id,
      friendId: b.friend_id,
      status: b.status,
      updatedAt: b.updated_at,
      userId: b.spot_id,
      nickname: b.spot_nickname,
      oneLine: b.one_line,
      photo: normalizeProfilePhoto(b.photo),
    })),
  };
}
