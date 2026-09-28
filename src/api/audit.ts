import { apiRequest } from "./client";

import type {
  AdminAuditLogFilters,
  AdminAuditLogListResponse,
} from "../types/audit";

function buildAuditLogQuery(
  filters: AdminAuditLogFilters = {},
): string {
  const params = new URLSearchParams();

  if (filters.action?.trim()) {
    params.set("action", filters.action.trim());
  }

  if (filters.success !== undefined) {
    params.set("success", String(filters.success));
  }

  if (filters.user_id !== undefined) {
    params.set("user_id", String(filters.user_id));
  }

  if (filters.resource_type?.trim()) {
    params.set(
      "resource_type",
      filters.resource_type.trim(),
    );
  }

  if (filters.resource_id !== undefined) {
    params.set("resource_id", String(filters.resource_id));
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

export async function getAdminAuditLogs(
  filters: AdminAuditLogFilters = {},
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminAuditLogListResponse> {
  const query = buildAuditLogQuery(filters);

  return apiRequest<AdminAuditLogListResponse>({
    method: "GET",
    path: `/api/profile/admin/audit-logs${query}`,
    accessToken,
    signal: options?.signal,
  });
}
