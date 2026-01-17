// src/lib/api/profile.ts
import { api8000 } from "@/src/lib/api/client";

export async function getMyProfile() {
  try {
    const res = await api8000.get("/friends");

    console.log("[GET /profile] response:", res?.data);

    return res?.data; // 그대로 반환
  } catch (err: any) {
    console.error("[GET /profile] error:", err);

    // axios면 보통 여기에도 정보가 있음
    console.error("[GET /profile] error.response?.data:", err?.response?.data);

    throw err; // 호출부에서 처리하게 올려버림
  }
}

export async function getBlocklist() {
  try {
    const res = await api8000.get("/settings/blocklist");
    console.log("[GET /settings/blocklist] response:", res?.data);
    return res?.data;
  } catch (err: any) {
    console.error("[GET /settings/blocklist] error:", err);
    console.error(
      "[GET /settings/blocklist] error.response?.data:",
      err?.response?.data,
    );
    throw err;
  }
}
