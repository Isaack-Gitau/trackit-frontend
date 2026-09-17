import { useQuery } from "@tanstack/react-query";

import { getMyClaims } from "../api/claims";

export function useMyClaims(
  accessToken: string | null,
) {
  return useQuery({
    queryKey: ["my-claims"],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load your claims.",
        );
      }

      return getMyClaims(
        accessToken,
        { signal },
      );
    },
    enabled: Boolean(accessToken),
  });
}
