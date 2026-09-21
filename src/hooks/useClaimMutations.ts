import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { withdrawClaim } from "../api/claims";

export function useWithdrawClaim(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      claimId,
      signal,
    }: {
      claimId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to withdraw a claim.",
        );
      }

      return withdrawClaim(
        claimId,
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["my-claims"],
      });

    },
  });
}
