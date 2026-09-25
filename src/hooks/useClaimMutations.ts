import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createClaim,
  withdrawClaim,
} from "../api/claims";
import type { ClaimCreatePayload } from "../types/claim";

export function useCreateClaim(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      payload,
      signal,
    }: {
      itemId: number;
      payload: ClaimCreatePayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to submit a claim.",
        );
      }

      return createClaim(
        itemId,
        payload,
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
