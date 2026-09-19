import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { deleteItem } from "../api/items";

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
