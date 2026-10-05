import { API_BASE_URL } from "./config";
import { apiRequest } from "./client";
import {
  ApiError,
  getApiErrorPayloadMessage,
} from "./errors";
import { notifyAuthInvalidation } from "./authEvents";

import type {
  AdminAuditLogFilters,
  AdminAuditLogListResponse,
  AdminAuditLogPreviewResponse,
  AuditLogExportFormat,
} from "../types/audit";

function buildAuditLogQuery(
  filters: AdminAuditLogFilters = {},
): string {
  const params = new URLSearchParams();

  if (filters.action?.trim()) {
    params.set("action", filters.action.trim());
  }

  if (filters.category?.trim()) {
    params.set("category", filters.category.trim());
  }

  if (filters.success !== undefined) {
    params.set("success", String(filters.success));
  }

  if (filters.user_id !== undefined) {
    params.set("user_id", String(filters.user_id));
  }

  if (filters.user_ids?.length) {
    for (const userId of filters.user_ids) {
      params.append("user_ids", String(userId));
    }
  }

  if (filters.subject_user_id !== undefined) {
    params.set(
      "subject_user_id",
      String(filters.subject_user_id),
    );
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

  if (filters.created_from) {
    params.set("created_from", filters.created_from);
  }

  if (filters.created_to) {
    params.set("created_to", filters.created_to);
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

export async function previewAdminAuditLogs(
  filters: AdminAuditLogFilters = {},
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<AdminAuditLogPreviewResponse> {
  const query = buildAuditLogQuery(filters);

  return apiRequest<AdminAuditLogPreviewResponse>({
    method: "GET",
    path: `/api/profile/admin/audit-logs/preview${query}`,
    accessToken,
    signal: options?.signal,
  });
}

export async function exportAdminAuditLogs(
  filters: AdminAuditLogFilters = {},
  format: AuditLogExportFormat = "csv",
  accessToken: string,
): Promise<void> {
  const query = buildAuditLogQuery(filters);
  const separator = query ? "&" : "?";
  const path =
    `/api/profile/admin/audit-logs/export${query}` +
    `${separator}format=${encodeURIComponent(format)}`;

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        method: "GET",
        headers: {
          Accept:
            format === "json"
              ? "application/json"
              : "text/csv",
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  } catch (error) {
    throw new ApiError(
      "TrackIt could not connect to the server. Please check your connection and try again.",
      0,
      error,
    );
  }

  if (!response.ok) {
    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      // Keep the payload null when the error response is not JSON.
    }

    if (response.status === 401) {
      notifyAuthInvalidation(accessToken);
    }

    const message =
      getApiErrorPayloadMessage(payload) ??
      `TrackIt request failed with status ${response.status}.`;

    throw new ApiError(
      message,
      response.status,
      payload,
    );
  }

  const blob = await response.blob();

  const disposition =
    response.headers.get("Content-Disposition") ?? "";

  const filenameMatch =
    disposition.match(
      /filename="?([^"]+)"?/i,
    );

  const filename =
    filenameMatch?.[1] ??
    `trackit-audit-logs.${format}`;

  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
