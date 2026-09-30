import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  dismissMatch,
  getItemMatches,
  getMatch,
  getMyMatches,
  restoreMatch,
} from "../api/matches";

export const matchQueryKeys = {
  all: ["matches"] as const,
  list: (includeDismissed: boolean) =>
    ["matches", "list", includeDismissed] as const,
  detail: (matchId: number) =>
    ["matches", "detail", matchId] as const,
  item: (itemId: number) =>
    ["matches", "item", itemId] as const,
};

export function useMyMatches(
  accessToken: string | null,
  includeDismissed = false,
) {
  return useQuery({
    queryKey: matchQueryKeys.list(
      includeDismissed,
    ),
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load your matches.",
        );
      }

      return getMyMatches(
        accessToken,
        {
          includeDismissed,
          signal,
        },
      );
    },
    enabled: Boolean(accessToken),
  });
}

export function useMatch(
  matchId: number | null,
  accessToken: string | null,
) {
  return useQuery({
    queryKey:
      matchId === null
        ? matchQueryKeys.detail(0)
        : matchQueryKeys.detail(matchId),
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load this match.",
        );
      }

      if (matchId === null) {
        throw new Error(
          "A valid match ID is required.",
        );
      }

      return getMatch(
        matchId,
        accessToken,
        { signal },
      );
    },
    enabled:
      Boolean(accessToken) && matchId !== null,
  });
}

export function useItemMatches(
  itemId: number | null,
  accessToken: string | null,
) {
  return useQuery({
    queryKey:
      itemId === null
        ? matchQueryKeys.item(0)
        : matchQueryKeys.item(itemId),
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load item matches.",
        );
      }

      if (itemId === null) {
        throw new Error(
          "A valid item ID is required.",
        );
      }

      return getItemMatches(
        itemId,
        accessToken,
        { signal },
      );
    },
    enabled:
      Boolean(accessToken) && itemId !== null,
  });
}

export function useDismissMatch(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: number) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to dismiss a match.",
        );
      }

      return dismissMatch(
        matchId,
        accessToken,
      );
    },

    onSuccess: (updatedMatch) => {
      void queryClient.invalidateQueries({
        queryKey: matchQueryKeys.list(
          true,
        ),
      });

      void queryClient.invalidateQueries({
        queryKey: matchQueryKeys.list(
          false,
        ),
      });

      void queryClient.invalidateQueries({
        queryKey: matchQueryKeys.detail(
          updatedMatch.id,
        ),
      });

      void queryClient.invalidateQueries({
        queryKey: ["matches", "item"],
      });
    },
  });
}

export function useRestoreMatch(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (matchId: number) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to restore a match.",
        );
      }

      return restoreMatch(
        matchId,
        accessToken,
      );
    },

    onSuccess: (updatedMatch) => {
      void queryClient.invalidateQueries({
        queryKey: matchQueryKeys.list(
          true,
        ),
      });

      void queryClient.invalidateQueries({
        queryKey: matchQueryKeys.list(
          false,
        ),
      });

      void queryClient.invalidateQueries({
        queryKey: matchQueryKeys.detail(
          updatedMatch.id,
        ),
      });

      void queryClient.invalidateQueries({
        queryKey: ["matches", "item"],
      });
    },
  });
}
