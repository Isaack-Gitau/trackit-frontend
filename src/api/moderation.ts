import { apiRequest } from "./client";

import type { ModerationClaim } from "../types/claim";
import type {
  Item,
  ItemStatus,
  ItemType,
} from "../types/item";
import type { ModerationReport } from "../types/report";
import type { ModerationUserDetail } from "../types/moderation";

export type ClaimRejectPayload = {
  rejection_reason: string;
};

export type ItemRejectPayload = {
  reason: string;
};

export type ReportResolvePayload = {
  resolution_note: string;
};

export type ModerationItemFilters = {
  search?: string;
  type?: ItemType;
  category?: string;
  location?: string;
  status?: ItemStatus;
  page?: number;
  limit?: number;
};

function buildModerationItemQuery(
  filters: ModerationItemFilters = {},
): string {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.category?.trim()) {
    params.set("category", filters.category.trim());
  }

  if (filters.location?.trim()) {
    params.set("location", filters.location.trim());
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
 * Moderation user details
 */

export async function getModerationUserDetail(
  userId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ModerationUserDetail> {
  return apiRequest<ModerationUserDetail>({
    method: "GET",
    path: `/api/profile/admin/${userId}`,
    accessToken,
    signal: options?.signal,
  });
}

/**
 * Claims moderation
 */

export async function getPendingClaims(
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ModerationClaim[]> {
  return apiRequest<ModerationClaim[]>({
    method: "GET",
    path: "/api/claims/admin/pending",
    accessToken,
    signal: options?.signal,
  });
}

export async function approveClaim(
  claimId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ModerationClaim> {
  return apiRequest<ModerationClaim>({
    method: "PATCH",
    path: `/api/claims/admin/${claimId}/approve`,
    accessToken,
    signal: options?.signal,
  });
}

export async function rejectClaim(
  claimId: number,
  payload: ClaimRejectPayload,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ModerationClaim> {
  return apiRequest<ModerationClaim>({
    method: "PATCH",
    path: `/api/claims/admin/${claimId}/reject`,
    body: payload,
    accessToken,
    signal: options?.signal,
  });
}

/**
 * Item moderation
 */

export async function getModerationItems(
  filters: ModerationItemFilters = {},
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Item[]> {
  const query = buildModerationItemQuery({
    page: 1,
    limit: 20,
    status: "pending",
    ...filters,
  });

  return apiRequest<Item[]>({
    method: "GET",
    path: `/api/items/admin/moderation${query}`,
    accessToken,
    signal: options?.signal,
  });
}

export async function approveItem(
  itemId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Item> {
  return apiRequest<Item>({
    method: "PATCH",
    path: `/api/items/${itemId}/approve`,
    accessToken,
    signal: options?.signal,
  });
}

export async function rejectItem(
  itemId: number,
  payload: ItemRejectPayload,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Item> {
  return apiRequest<Item>({
    method: "PATCH",
    path: `/api/items/${itemId}/reject`,
    body: payload,
    accessToken,
    signal: options?.signal,
  });
}

/**
 * Report moderation
 */

export async function getPendingReports(
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ModerationReport[]> {
  return apiRequest<ModerationReport[]>({
    method: "GET",
    path: "/api/reports/admin/pending",
    accessToken,
    signal: options?.signal,
  });
}

export async function getReviewedReports(
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ModerationReport[]> {
  return apiRequest<ModerationReport[]>({
    method: "GET",
    path: "/api/reports/admin/reviewed",
    accessToken,
    signal: options?.signal,
  });
}

export async function reviewReport(
  reportId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ModerationReport> {
  return apiRequest<ModerationReport>({
    method: "PATCH",
    path: `/api/reports/admin/${reportId}/review`,
    accessToken,
    signal: options?.signal,
  });
}

export async function resolveReport(
  reportId: number,
  payload: ReportResolvePayload,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<ModerationReport> {
  return apiRequest<ModerationReport>({
    method: "PATCH",
    path: `/api/reports/admin/${reportId}/resolve`,
    body: payload,
    accessToken,
    signal: options?.signal,
  });
}

/**
 * Comment moderation
 */

export async function deleteCommentAsModerator(
  commentId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<void> {
  await apiRequest<void>({
    method: "DELETE",
    path: `/api/comments/admin/comments/${commentId}`,
    accessToken,
    signal: options?.signal,
  });
}