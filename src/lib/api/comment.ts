import { api8000 } from "./client";

export type CommentVisibility = "PUBLIC" | "FRIENDS";

export type CreateCommentRequest = {
  place_id: number;
  content: string;
  visibility?: CommentVisibility; // optional이면 서버가 default 처리할 수도
  rating?: number | null;
  files?: string[] | null;
};

export async function createComment(body: CreateCommentRequest) {
  const res = await api8000.request({
    url: "/comments",
    method: "POST",
    data: body,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
}
