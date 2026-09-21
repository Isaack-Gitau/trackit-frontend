import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  deleteAllNotifications,
  deleteNotification,
  deleteSelectedNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notifications";

import type {
  NotificationDeleteSelectedPayload,
} from "../types/notification";

import {
  notificationQueryKeys,
} from "./useNotifications";

function invalidateNotificationQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({
    queryKey: notificationQueryKeys.all,
  });

  void queryClient.invalidateQueries({
    queryKey: notificationQueryKeys.unread,
  });

  void queryClient.invalidateQueries({
    queryKey: notificationQueryKeys.unreadCount,
  });
}

export function useMarkNotificationAsRead(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      signal,
    }: {
      notificationId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to mark a notification as read.",
        );
      }

      return markNotificationAsRead(
        notificationId,
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}

export function useMarkAllNotificationsAsRead(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      signal,
    }: {
      signal?: AbortSignal;
    } = {}) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to mark notifications as read.",
        );
      }

      return markAllNotificationsAsRead(
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}

export function useDeleteNotification(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      notificationId,
      signal,
    }: {
      notificationId: number;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to delete a notification.",
        );
      }

      return deleteNotification(
        notificationId,
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}

export function useDeleteSelectedNotifications(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payload,
      signal,
    }: {
      payload: NotificationDeleteSelectedPayload;
      signal?: AbortSignal;
    }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to delete notifications.",
        );
      }

      return deleteSelectedNotifications(
        payload,
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}

export function useDeleteAllNotifications(
  accessToken: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      signal,
    }: {
      signal?: AbortSignal;
    } = {}) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to delete notifications.",
        );
      }

      return deleteAllNotifications(
        accessToken,
        { signal },
      );
    },
    onSuccess: () => {
      invalidateNotificationQueries(queryClient);
    },
  });
}
