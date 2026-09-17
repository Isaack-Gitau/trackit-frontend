import { API_BASE_URL } from "./config";
import { ApiError } from "./errors";

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
  accessToken?: string;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== "undefined" && value instanceof FormData;
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof Blob ||
    value instanceof ArrayBuffer ||
    value instanceof FormData ||
    value instanceof URLSearchParams
  );
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
}

function getErrorMessage(
  payload: unknown,
  fallback: string,
): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.detail === "string" && record.detail.trim()) {
      return record.detail;
    }

    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
  }

  return fallback;
}

export async function apiRequest<T = unknown>({
  method = "GET",
  path,
  body,
  accessToken,
  signal,
  headers = {},
}: ApiRequestOptions): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const requestHeaders = new Headers({
    Accept: "application/json",
    ...headers,
  });

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let requestBody: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (isFormData(body) || isBodyInit(body)) {
      requestBody = body;
    } else {
      requestHeaders.set("Content-Type", "application/json");
      requestBody = JSON.stringify(body);
    }
  }

  const response = await fetch(
    `${API_BASE_URL}${normalizedPath}`,
    {
      method,
      headers: requestHeaders,
      body: requestBody,
      signal,
    },
  );

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(
        payload,
        `TrackIt request failed with status ${response.status}.`,
      ),
      response.status,
      payload,
    );
  }

  return payload as T;
}
