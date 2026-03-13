import { api8000 } from "./client";

export type CommentVisibility = "public" | "friend";

export type CreateCommentRequest = {
  place_id: number;
  content: string;
  visibility?: CommentVisibility;
  rating?: number | null;
  files?: Array<{
    uri: string;
    name: string;
    type: string;
  }>;
};

export async function createComment(body: CreateCommentRequest) {
  const formData = new FormData();

  formData.append("place_id", String(body.place_id));
  formData.append("content", body.content);

  if (body.visibility) {
    formData.append("visibility", body.visibility);
  }

  if (body.rating != null) {
    formData.append("rating", String(body.rating));
  }

  if (body.files && body.files.length > 0) {
    body.files.forEach((file) => {
      formData.append("files", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
    });
  }

  const res = await api8000.request({
    url: "/comments",
    method: "POST",
    data: formData,
  });

  return res.data;
}
