import { apiRequest } from "./client";

import type {
  CommentCreatePayload,
  CommentUpdatePayload,
  ItemComment,
} from "../types/comment";

export async function getItemComments(
  itemId: number,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ItemComment[]> {
  return apiRequest<ItemComment[]>({
    method: "GET",
    path: `/api/items/${itemId}/comments`,
    signal: options?.signal,
  });
}

export async function createItemComment(
  itemId: number,
  payload: CommentCreatePayload,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ItemComment> {
  return apiRequest<ItemComment>({
    method: "POST",
    path: `/api/items/${itemId}/comments`,
    body: payload,
    accessToken,
    signal: options?.signal,
  });
}

export async function updateComment(
  commentId: number,
  payload: CommentUpdatePayload,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ItemComment> {
  return apiRequest<ItemComment>({
    method: "PATCH",
    path: `/api/comments/${commentId}`,
    body: payload,
    accessToken,
    signal: options?.signal,
  });
}

export async function deleteComment(
  commentId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<null> {
  return apiRequest<null>({
    method: "DELETE",
    path: `/api/comments/${commentId}`,
    accessToken,
    signal: options?.signal,
  });
}
