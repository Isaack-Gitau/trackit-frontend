import { apiRequest } from "./client";

import type {
  Notification,
  NotificationDeleteResponse,
  NotificationDeleteSelectedPayload,
  NotificationMarkAllReadResponse,
  NotificationReadResponse,
  NotificationUnreadCountResponse,
} from "../types/notification";

export async function getNotifications(
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Notification[]> {
  return apiRequest<Notification[]>({
    method: "GET",
    path: "/api/notifications",
    accessToken,
    signal: options?.signal,
  });
}

export async function getUnreadNotifications(
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Notification[]> {
  return apiRequest<Notification[]>({
    method: "GET",
    path: "/api/notifications/unread",
    accessToken,
    signal: options?.signal,
  });
}

export async function getUnreadNotificationCount(
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<NotificationUnreadCountResponse> {
  return apiRequest<NotificationUnreadCountResponse>({
    method: "GET",
    path: "/api/notifications/unread/count",
    accessToken,
    signal: options?.signal,
  });
}

export async function getNotification(
  notificationId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Notification> {
  return apiRequest<Notification>({
    method: "GET",
    path: `/api/notifications/${notificationId}`,
    accessToken,
    signal: options?.signal,
  });
}

export async function markNotificationAsRead(
  notificationId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<NotificationReadResponse> {
  return apiRequest<NotificationReadResponse>({
    method: "PATCH",
    path: `/api/notifications/${notificationId}/read`,
    accessToken,
    signal: options?.signal,
  });
}

export async function markAllNotificationsAsRead(
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<NotificationMarkAllReadResponse> {
  return apiRequest<NotificationMarkAllReadResponse>({
    method: "PATCH",
    path: "/api/notifications/read-all",
    accessToken,
    signal: options?.signal,
  });
}

export async function deleteNotification(
  notificationId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<NotificationDeleteResponse> {
  return apiRequest<NotificationDeleteResponse>({
    method: "DELETE",
    path: `/api/notifications/${notificationId}`,
    accessToken,
    signal: options?.signal,
  });
}

export async function deleteSelectedNotifications(
  payload: NotificationDeleteSelectedPayload,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<NotificationDeleteResponse> {
  return apiRequest<NotificationDeleteResponse>({
    method: "DELETE",
    path: "/api/notifications/selected",
    body: payload,
    accessToken,
    signal: options?.signal,
  });
}

export async function deleteAllNotifications(
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<NotificationDeleteResponse> {
  return apiRequest<NotificationDeleteResponse>({
    method: "DELETE",
    path: "/api/notifications",
    accessToken,
    signal: options?.signal,
  });
}
