import { apiRequest } from "./client";

import type {
  Item,
  PublicItemFilters,
} from "../types/item";

function buildPublicItemQuery(
  filters: PublicItemFilters = {},
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

  if (filters.page !== undefined) {
    params.set("page", String(filters.page));
  }

  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }

  const query = params.toString();

  return query ? `?${query}` : "";
}

export async function getPublicItems(
  filters: PublicItemFilters = {},
  options?: {
    signal?: AbortSignal;
  },
): Promise<Item[]> {
  const query = buildPublicItemQuery({
    page: 1,
    limit: 20,
    ...filters,
  });

  return apiRequest<Item[]>({
    method: "GET",
    path: `/api/items${query}`,
    signal: options?.signal,
  });
}

export async function getPublicItem(
  itemId: number,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Item> {
  return apiRequest<Item>({
    method: "GET",
    path: `/api/items/${itemId}`,
    signal: options?.signal,
  });
}

export async function getMyItems(
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Item[]> {
  return apiRequest<Item[]>({
    method: "GET",
    path: "/api/items/me/items",
    accessToken,
    signal: options?.signal,
  });
}

export async function deleteItem(
  itemId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<void> {
  await apiRequest<void>({
    method: "DELETE",
    path: `/api/items/${itemId}`,
    accessToken,
    signal: options?.signal,
  });
}
