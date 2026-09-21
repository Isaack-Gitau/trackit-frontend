import { useQuery } from "@tanstack/react-query";

import {
  getNotifications,
  getUnreadNotificationCount,
  getUnreadNotifications,
} from "../api/notifications";

export const notificationQueryKeys = {
  all: ["notifications"] as const,
  unread: ["notifications", "unread"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

export function useNotifications(
  accessToken: string | null,
) {
  return useQuery({
    queryKey: notificationQueryKeys.all,
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load your notifications.",
        );
      }

      return getNotifications(
        accessToken,
        { signal },
      );
    },
    enabled: Boolean(accessToken),
  });
}

export function useUnreadNotifications(
  accessToken: string | null,
) {
  return useQuery({
    queryKey: notificationQueryKeys.unread,
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load your unread notifications.",
        );
      }

      return getUnreadNotifications(
        accessToken,
        { signal },
      );
    },
    enabled: Boolean(accessToken),
  });
}

export function useUnreadNotificationCount(
  accessToken: string | null,
) {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error(
          "Authentication is required to load your unread notification count.",
        );
      }

      return getUnreadNotificationCount(
        accessToken,
        { signal },
      );
    },
    enabled: Boolean(accessToken),
  });
}
