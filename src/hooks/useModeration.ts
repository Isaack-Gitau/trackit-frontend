import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  approveClaim,
  approveItem,
  deleteCommentAsModerator,
  getModerationItems,
  getModerationUserDetail,
  getPendingClaims,
  getPendingReports,
  getReviewedReports,
  rejectClaim,
  rejectItem,
  resolveReport,
  reviewReport,
} from "../api/moderation";

import type {
  ClaimRejectPayload,
  ItemRejectPayload,
  ModerationItemFilters,
  ReportResolvePayload,
} from "../api/moderation";

export const moderationQueryKeys = {
  all: ["moderation"] as const,

  claims: ["moderation", "claims"] as const,
  pendingClaims: ["moderation", "claims", "pending"] as const,

  items: ["moderation", "items"] as const,

  userDetail: (userId: number) =>
    ["moderation", "user-detail", userId] as const,

  reports: ["moderation", "reports"] as const,
  pendingReports: ["moderation", "reports", "pending"] as const,
  reviewedReports: ["moderation", "reports", "reviewed"] as const,
};

/**
 * Moderation user details
 */

export function useModerationUserDetail(
  userId: number | null,
  accessToken: string | null,
) {
  return useQuery({
    queryKey:
      userId === null
        ? ["moderation", "user-detail", "none"]
        : moderationQueryKeys.userDetail(userId),

    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load user details.",
        );
      }

      if (userId === null) {
        throw new Error(
          "A valid user ID is required to load user details.",
        );
      }

      return getModerationUserDetail(
        userId,
        accessToken,
        { signal },
      );
    },

    enabled:
      userId !== null &&
      Number.isInteger(userId) &&
      userId > 0 &&
      Boolean(accessToken),
  });
}

/**
 * Pending claims
 */

export function usePendingClaims(
  accessToken: string | null,
) {
  return useQuery({
    queryKey: moderationQueryKeys.pendingClaims,

    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load pending claims.",
        );
      }

      return getPendingClaims(
        accessToken,
        { signal },
      );
    },

    enabled: Boolean(accessToken),
  });
}

/**
 * Claim moderation
 */

export function useApproveClaim(
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
          "Authentication is required to approve a claim.",
        );
      }

      return approveClaim(
        claimId,
        accessToken,
        { signal },
      );
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: moderationQueryKeys.pendingClaims,
      });

      void queryClient.invalidateQueries({
        queryKey: ["my-claims"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["public-items"],
      });
    },
  });
}

export function useRejectClaim(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      claimId,
      payload,
      signal,
    }: {
      claimId: number;
      payload: ClaimRejectPayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to reject a claim.",
        );
      }

      return rejectClaim(
        claimId,
        payload,
        accessToken,
        { signal },
      );
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: moderationQueryKeys.pendingClaims,
      });

      void queryClient.invalidateQueries({
        queryKey: ["my-claims"],
      });
    },
  });
}

/**
 * Moderation items
 */

export function useModerationItems(
  filters: ModerationItemFilters = {},
  accessToken: string | null,
) {
  return useQuery({
    queryKey: [
      ...moderationQueryKeys.items,
      filters,
    ],

    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load moderation items.",
        );
      }

      return getModerationItems(
        filters,
        accessToken,
        { signal },
      );
    },

    enabled: Boolean(accessToken),
  });
}

/**
 * Pending and reviewed reports
 */

export function usePendingReports(
  accessToken: string | null,
) {
  return useQuery({
    queryKey: moderationQueryKeys.pendingReports,

    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load pending reports.",
        );
      }

      return getPendingReports(
        accessToken,
        { signal },
      );
    },

    enabled: Boolean(accessToken),
  });
}

export function useReviewedReports(
  accessToken: string | null,
) {
  return useQuery({
    queryKey: moderationQueryKeys.reviewedReports,

    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load reviewed reports.",
        );
      }

      return getReviewedReports(
        accessToken,
        { signal },
      );
    },

    enabled: Boolean(accessToken),
  });
}

/**
 * Report moderation
 */

export function useReviewReport(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      signal,
    }: {
      reportId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to review a report.",
        );
      }

      return reviewReport(
        reportId,
        accessToken,
        { signal },
      );
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: moderationQueryKeys.pendingReports,
      });

      void queryClient.invalidateQueries({
        queryKey: moderationQueryKeys.reviewedReports,
      });
    },
  });
}

export function useResolveReport(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportId,
      payload,
      signal,
    }: {
      reportId: number;
      payload: ReportResolvePayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to resolve a report.",
        );
      }

      return resolveReport(
        reportId,
        payload,
        accessToken,
        { signal },
      );
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: moderationQueryKeys.pendingReports,
      });

      void queryClient.invalidateQueries({
        queryKey: moderationQueryKeys.reviewedReports,
      });
    },
  });
}

/**
 * Item moderation
 */

export function useApproveItem(
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
          "Authentication is required to approve an item.",
        );
      }

      return approveItem(
        itemId,
        accessToken,
        { signal },
      );
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: moderationQueryKeys.items,
      });

      void queryClient.invalidateQueries({
        queryKey: ["my-items"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["public-items"],
      });
    },
  });
}

export function useRejectItem(
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
      payload: ItemRejectPayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to reject an item.",
        );
      }

      return rejectItem(
        itemId,
        payload,
        accessToken,
        { signal },
      );
    },

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: moderationQueryKeys.items,
      });

      void queryClient.invalidateQueries({
        queryKey: ["my-items"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["public-items"],
      });
    },
  });
}

/**
 * Comment moderation
 */

export function useDeleteCommentAsModerator(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      signal,
    }: {
      commentId: number;
      itemId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to moderate a comment.",
        );
      }

      return deleteCommentAsModerator(
        commentId,
        accessToken,
        { signal },
      );
    },

    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["item-comments", variables.itemId],
      });
    },
  });
}
