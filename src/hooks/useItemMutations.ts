import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createItem,
  deleteItem,
} from "../api/items";

import type {
  CreateItemPayload,
} from "../types/item";

export function useCreateItem(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      signal,
    }: {
      payload: CreateItemPayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to post an item.",
        );
      }

      return createItem(
        payload,
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["my-items"],
      });
    },
  });
}

export function useDeleteItem(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      signal,
    }: {
      itemId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to delete an item.",
        );
      }

      return deleteItem(
        itemId,
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["my-items"],
      });
    },
  });
}