import { apiRequest } from "./client";

import type { Match } from "../types/match";

export async function getMyMatches(
  accessToken: string,
  options?: {
    includeDismissed?: boolean;
    signal?: AbortSignal;
  },
): Promise<Match[]> {
  const params = new URLSearchParams();

  if (options?.includeDismissed) {
    params.set("include_dismissed", "true");
  }

  const query = params.toString();

  return apiRequest<Match[]>({
    method: "GET",
    path: query
      ? `/api/matches?${query}`
      : "/api/matches",
    accessToken,
    signal: options?.signal,
  });
}

export async function getMatch(
  matchId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Match> {
  return apiRequest<Match>({
    method: "GET",
    path: `/api/matches/${matchId}`,
    accessToken,
    signal: options?.signal,
  });
}

export async function getItemMatches(
  itemId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Match[]> {
  return apiRequest<Match[]>({
    method: "GET",
    path: `/api/matches/items/${itemId}`,
    accessToken,
    signal: options?.signal,
  });
}

export async function dismissMatch(
  matchId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Match> {
  return apiRequest<Match>({
    method: "PATCH",
    path: `/api/matches/${matchId}/dismiss`,
    accessToken,
    signal: options?.signal,
  });
}

export async function restoreMatch(
  matchId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Match> {
  return apiRequest<Match>({
    method: "PATCH",
    path: `/api/matches/${matchId}/restore`,
    accessToken,
    signal: options?.signal,
  });
}
