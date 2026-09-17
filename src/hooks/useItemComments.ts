import { useQuery } from "@tanstack/react-query";

import { getItemComments } from "../api/comments";

export function useItemComments(itemId: number | null) {
  return useQuery({
    queryKey: ["item-comments", itemId],
    queryFn: ({ signal }) => {
      if (itemId === null) {
        throw new Error("A valid item ID is required.");
      }

      return getItemComments(itemId, { signal });
    },
    enabled: itemId !== null,
  });
}
