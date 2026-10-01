import { apiRequest } from "./client";

import type {
  AdminEmailPayload,
  AdminEmailResponse,
  AdminUserDetail,
  AdminUserFilters,
  AdminUserListResponse,
  UserSuspensionPayload,
} from "../types/admin";

function buildAdminUserQuery(
  filters: AdminUserFilters = {},
): string {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.role) {
    params.set("role", filters.role);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

/**
 * User directory
 */

export async function getAdminUsers(
  filters: AdminUserFilters = {},
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminUserListResponse> {
  const query = buildAdminUserQuery(filters);

  return apiRequest<AdminUserListResponse>({
    method: "GET",
    path: `/api/profile/admin/users${query}`,
    accessToken,
    signal: options?.signal,
  });
}

/**
 * User detail
 */

export async function getAdminUserDetail(
  userId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>({
    method: "GET",
    path: `/api/profile/admin/${userId}`,
    accessToken,
    signal: options?.signal,
  });
}

/**
 * Role management
 */

export async function promoteUserToModerator(
  userId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>({
    method: "POST",
    path: `/api/profile/admin/${userId}/promote`,
    accessToken,
    signal: options?.signal,
  });
}

export async function promoteModeratorToAdmin(
  userId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>({
    method: "POST",
    path: `/api/profile/admin/${userId}/promote-admin`,
    accessToken,
    signal: options?.signal,
  });
}

export async function demoteAdminToModerator(
  userId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>({
    method: "PATCH",
    path: `/api/profile/admin/${userId}/demote-admin`,
    accessToken,
    signal: options?.signal,
  });
}

export async function revokeModerator(
  userId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>({
    method: "PATCH",
    path: `/api/profile/admin/${userId}/revoke-moderator`,
    accessToken,
    signal: options?.signal,
  });
}

/**
 * Account lifecycle
 */

export async function deactivateUser(
  userId: number,
  payload: UserSuspensionPayload,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>({
    method: "PATCH",
    path: `/api/profile/admin/${userId}/deactivate`,
    body: payload,
    accessToken,
    signal: options?.signal,
  });
}

export async function activateUser(
  userId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminUserDetail> {
  return apiRequest<AdminUserDetail>({
    method: "PATCH",
    path: `/api/profile/admin/${userId}/activate`,
    accessToken,
    signal: options?.signal,
  });
}

export async function deleteAdminUser(
  userId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<void> {
  return apiRequest<void>({
    method: "DELETE",
    path: `/api/profile/admin/${userId}`,
    accessToken,
    signal: options?.signal,
  });
}

/**
 * Custom administrator email
 */

export async function sendAdminEmail(
  payload: AdminEmailPayload,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminEmailResponse> {
  return apiRequest<AdminEmailResponse>({
    method: "POST",
    path: "/api/profile/admin/email",
    body: payload,
    accessToken,
    signal: options?.signal,
  });
}
