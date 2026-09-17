import { apiRequest } from "./client";

import type {
  Claim,
  ClaimCreatePayload,
} from "../types/claim";

export async function getMyClaims(
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Claim[]> {
  return apiRequest<Claim[]>({
    method: "GET",
    path: "/api/claims/me",
    accessToken,
    signal: options?.signal,
  });
}

export async function createClaim(
  itemId: number,
  payload: ClaimCreatePayload,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Claim> {
  return apiRequest<Claim>({
    method: "POST",
    path: `/api/claims/items/${itemId}`,
    body: payload,
    accessToken,
    signal: options?.signal,
  });
}

export async function getClaim(
  claimId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Claim> {
  return apiRequest<Claim>({
    method: "GET",
    path: `/api/claims/${claimId}`,
    accessToken,
    signal: options?.signal,
  });
}

export async function withdrawClaim(
  claimId: number,
  accessToken: string,
  options?: {
    signal?: AbortSignal;
  },
): Promise<Claim> {
  return apiRequest<Claim>({
    method: "POST",
    path: `/api/claims/${claimId}/withdraw`,
    accessToken,
    signal: options?.signal,
  });
}
