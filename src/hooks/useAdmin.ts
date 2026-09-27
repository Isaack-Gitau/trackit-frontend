import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  activateUser,
  deactivateUser,
  demoteAdminToModerator,
  getAdminUserDetail,
  getAdminUsers,
  promoteModeratorToAdmin,
  promoteUserToModerator,
  revokeModerator,
  sendAdminEmail,
} from "../api/admin";

import type {
  AdminEmailPayload,
  AdminUserFilters,
  UserSuspensionPayload,
} from "../types/admin";

export const adminQueryKeys = {
  all: ["admin"] as const,

  users: ["admin", "users"] as const,

  userDetail: (userId: number) =>
    ["admin", "user-detail", userId] as const,
};

/**
 * User directory
 */

export function useAdminUsers(
  filters: AdminUserFilters = {},
  accessToken: string | null,
) {
  return useQuery({
    queryKey: [
      ...adminQueryKeys.users,
      filters,
    ],

    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load users.",
        );
      }

      return getAdminUsers(
        filters,
        accessToken,
        { signal },
      );
    },

    enabled: Boolean(accessToken),
  });
}

/**
 * User detail
 */

export function useAdminUserDetail(
  userId: number | null,
  accessToken: string | null,
) {
  return useQuery({
    queryKey:
      userId === null
        ? ["admin", "user-detail", "none"]
        : adminQueryKeys.userDetail(userId),

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

      return getAdminUserDetail(
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

function invalidateAdminUserData(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: number,
) {
  void queryClient.invalidateQueries({
    queryKey: adminQueryKeys.users,
  });

  void queryClient.invalidateQueries({
    queryKey: adminQueryKeys.userDetail(userId),
  });
}

/**
 * Role management
 */

export function usePromoteUserToModerator(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      signal,
    }: {
      userId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to change user roles.",
        );
      }

      return promoteUserToModerator(
        userId,
        accessToken,
        { signal },
      );
    },

    onSuccess: (_user, variables) => {
      invalidateAdminUserData(
        queryClient,
        variables.userId,
      );
    },
  });
}

export function usePromoteModeratorToAdmin(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      signal,
    }: {
      userId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to change user roles.",
        );
      }

      return promoteModeratorToAdmin(
        userId,
        accessToken,
        { signal },
      );
    },

    onSuccess: (_user, variables) => {
      invalidateAdminUserData(
        queryClient,
        variables.userId,
      );
    },
  });
}

export function useDemoteAdminToModerator(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      signal,
    }: {
      userId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to change user roles.",
        );
      }

      return demoteAdminToModerator(
        userId,
        accessToken,
        { signal },
      );
    },

    onSuccess: (_user, variables) => {
      invalidateAdminUserData(
        queryClient,
        variables.userId,
      );
    },
  });
}

export function useRevokeModerator(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      signal,
    }: {
      userId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to change user roles.",
        );
      }

      return revokeModerator(
        userId,
        accessToken,
        { signal },
      );
    },

    onSuccess: (_user, variables) => {
      invalidateAdminUserData(
        queryClient,
        variables.userId,
      );
    },
  });
}

/**
 * Account lifecycle
 */

export function useDeactivateUser(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
      signal,
    }: {
      userId: number;
      payload: UserSuspensionPayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to deactivate an account.",
        );
      }

      return deactivateUser(
        userId,
        payload,
        accessToken,
        { signal },
      );
    },

    onSuccess: (_user, variables) => {
      invalidateAdminUserData(
        queryClient,
        variables.userId,
      );
    },
  });
}

export function useActivateUser(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      signal,
    }: {
      userId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to activate an account.",
        );
      }

      return activateUser(
        userId,
        accessToken,
        { signal },
      );
    },

    onSuccess: (_user, variables) => {
      invalidateAdminUserData(
        queryClient,
        variables.userId,
      );
    },
  });
}

/**
 * Custom email
 */

export function useSendAdminEmail(
  accessToken: string | null,
) {
  return useMutation({
    mutationFn: ({
      payload,
      signal,
    }: {
      payload: AdminEmailPayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to send administrator email.",
        );
      }

      return sendAdminEmail(
        payload,
        accessToken,
        { signal },
      );
    },
  });
}
