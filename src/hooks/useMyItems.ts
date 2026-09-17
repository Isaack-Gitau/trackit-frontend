import { useQuery } from "@tanstack/react-query";

import { getMyItems } from "../api/items";

export function useMyItems(
  accessToken: string | null,
) {
  return useQuery({
    queryKey: ["my-items"],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load your items.",
        );
      }

      return getMyItems(
        accessToken,
        { signal },
      );
    },
    enabled: Boolean(accessToken),
  });
}
