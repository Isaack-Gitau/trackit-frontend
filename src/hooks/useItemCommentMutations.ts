import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createItemComment,
  deleteComment,
  updateComment,
} from "../api/comments";

import type {
  CommentCreatePayload,
  CommentUpdatePayload,
} from "../types/comment";

export function useCreateItemComment(
  itemId: number | null,
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      signal,
    }: {
      payload: CommentCreatePayload;
      signal?: AbortSignal;
    }) => {
      if (itemId === null || !accessToken) {
        throw new Error(
          "Authentication is required to create a comment.",
        );
      }

      return createItemComment(
        itemId,
        payload,
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      if (itemId !== null) {
        void queryClient.invalidateQueries({
          queryKey: ["item-comments", itemId],
        });
      }
    },
  });
}

export function useUpdateComment(
  itemId: number | null,
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      payload,
      signal,
    }: {
      commentId: number;
      payload: CommentUpdatePayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to update a comment.",
        );
      }

      return updateComment(
        commentId,
        payload,
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      if (itemId !== null) {
        void queryClient.invalidateQueries({
          queryKey: ["item-comments", itemId],
        });
      }
    },
  });
}

export function useDeleteComment(
  itemId: number | null,
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      signal,
    }: {
      commentId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to delete a comment.",
        );
      }

      return deleteComment(
        commentId,
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      if (itemId !== null) {
        void queryClient.invalidateQueries({
          queryKey: ["item-comments", itemId],
        });
      }
    },
  });
}
