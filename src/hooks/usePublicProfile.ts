import { useQuery } from "@tanstack/react-query";

import { getPublicProfile } from "../api/profiles";

type UsePublicProfileOptions = {
  userId: number | null;
  accessToken: string | null;
};

export function usePublicProfile({
  userId,
  accessToken,
}: UsePublicProfileOptions) {
  return useQuery({
    queryKey: ["public-profile", userId],
    queryFn: ({ signal }) => {
      if (userId === null || !accessToken) {
        throw new Error("A user ID and access token are required.");
      }

      return getPublicProfile(
        userId,
        accessToken,
        signal,
      );
    },
    enabled: userId !== null && Boolean(accessToken),
  });
}
