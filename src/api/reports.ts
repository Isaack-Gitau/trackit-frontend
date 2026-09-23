import { apiRequest } from "./client";

import type {
  CreateReportPayload,
  Report,
} from "../types/report";

export async function createReport(
  itemId: number,
  payload: CreateReportPayload,
  accessToken: string,
  options?: { signal?: AbortSignal },
): Promise<Report> {
  return apiRequest<Report>({
    method: "POST",
    path: `/api/reports/items/${itemId}`,
    body: payload,
    accessToken,
    signal: options?.signal,
  });
}

export async function getMyReports(
  accessToken: string,
  options?: { signal?: AbortSignal },
): Promise<Report[]> {
  return apiRequest<Report[]>({
    method: "GET",
    path: "/api/reports/me",
    accessToken,
    signal: options?.signal,
  });
}

export async function getReport(
  reportId: number,
  accessToken: string,
  options?: { signal?: AbortSignal },
): Promise<Report> {
  return apiRequest<Report>({
    method: "GET",
    path: `/api/reports/${reportId}`,
    accessToken,
    signal: options?.signal,
  });
}

export async function withdrawReport(
  reportId: number,
  accessToken: string,
): Promise<Report> {
  return apiRequest<Report>({
    method: "POST",
    path: `/api/reports/${reportId}/withdraw`,
    accessToken,
  });
}
