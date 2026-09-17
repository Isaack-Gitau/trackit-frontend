import { useQuery } from "@tanstack/react-query";

import { getPublicItem } from "../api/items";

export function usePublicItem(itemId: number | null) {
  return useQuery({
    queryKey: ["public-item", itemId],
    queryFn: ({ signal }) => {
      if (itemId === null) {
        throw new Error("A valid item ID is required.");
      }

      return getPublicItem(itemId, { signal });
    },
    enabled: itemId !== null,
  });
}
