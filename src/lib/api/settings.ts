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
};

export async function fetchBlockList(): Promise<{
  total: number;
  blocks: BlockItem[];
}> {
  try {
    const res = await api8000.get<BlockListResponse>("/settings/blocklist");
    const raw = Array.isArray(res.data?.data?.blocks)
      ? res.data.data.blocks
      : [];

    return {
      total: Number(res.data?.data?.total ?? raw.length),
      blocks: raw.map((b) => ({
        id: b.id,
        memberId: b.member_id,
        friendId: b.friend_id,
        status: b.status,
        updatedAt: b.updated_at,
      })),
    };
  } catch {
    return { total: 0, blocks: [] };
  }
}
