import { useQuery } from "@tanstack/react-query";

import { getProfile } from "../api/profiles";

export function useProfile(
  accessToken: string | null,
) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load your profile.",
        );
      }

      return getProfile(
        accessToken,
        signal,
      );
    },
    enabled: Boolean(accessToken),
  });
}
