import { API_BASE_URL } from "./config";
import {
  ApiError,
  getApiErrorPayloadMessage,
} from "./errors";
import { notifyAuthInvalidation } from "./authEvents";

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

async function parseResponseBody(
  response: Response,
): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType =
    response.headers.get("content-type") ?? "";

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

export async function apiRequest<T = unknown>({
  method = "GET",
  path,
  body,
  accessToken,
  signal,
  headers = {},
}: ApiRequestOptions): Promise<T> {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const requestHeaders = new Headers({
    Accept: "application/json",
    ...headers,
  });

  if (accessToken) {
    requestHeaders.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  let requestBody: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (isFormData(body) || isBodyInit(body)) {
      requestBody = body;
    } else {
      requestHeaders.set(
        "Content-Type",
        "application/json",
      );

      requestBody = JSON.stringify(body);
    }
  }

  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}${normalizedPath}`,
      {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal,
      },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(
      "TrackIt could not connect to the server. Please check your connection and try again.",
      0,
      error,
    );
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && accessToken) {
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

  return payload as T;
}
