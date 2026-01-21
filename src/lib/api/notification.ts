// src/lib/api/notifications.ts
import { api8001 } from "@/src/lib/api/client";
import type { ApiEnvelope } from "@/src/lib/api/common";

// ============
// GET /notifications?limit=20&offset=0
// ============
export type ApiNotification = {
  id: number;
  type: string;
  title: string;
  body: string;
  route: string;
  cta: string;
  is_read: boolean;
  created_at: string; // ISO
};

export type NotificationsResponse = ApiEnvelope<{
  total: number;
  notifications: ApiNotification[];
}>;

export type NotificationItem = {
  id: number;
  type: string;
  title: string;
  body: string;
  route: string;
  cta: string;
  isRead: boolean;
  createdAt: string;
};

export async function fetchNotifications(params?: {
  limit?: number;
  offset?: number;
}): Promise<{ total: number; notifications: NotificationItem[] }> {
  try {
    const res = await api8001.get<NotificationsResponse>("/notifications", {
      params: {
        ...(params?.limit !== undefined ? { limit: params.limit } : {}),
        ...(params?.offset !== undefined ? { offset: params.offset } : {}),
      },
    });

    const raw = Array.isArray(res.data?.data?.notifications)
      ? res.data.data.notifications
      : [];

    return {
      total: Number(res.data?.data?.total ?? raw.length),
      notifications: raw.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        route: n.route,
        cta: n.cta,
        isRead: n.is_read,
        createdAt: n.created_at,
      })),
    };
  } catch {
    return { total: 0, notifications: [] };
  }
}

// ============
// POST /notifications/read
// body: { notification_ids: number[] }
// ============
export type ReadNotificationsResponse = ApiEnvelope<{
  message: string;
}>;

export async function readNotifications(
  notificationIds: number[],
): Promise<boolean> {
  try {
    await api8001.post<ReadNotificationsResponse>("/notifications/read", {
      notification_ids: notificationIds,
    });
    return true;
  } catch {
    return false;
  }
}
