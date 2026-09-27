export type ApiErrorPayload = {
  detail?: unknown;
  message?: unknown;
};

type ValidationErrorEntry = {
  loc?: unknown;
  msg?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly detail: unknown;

  constructor(
    message: string,
    status: number,
    detail?: unknown,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

function formatValidationLocation(location: unknown): string {
  if (!Array.isArray(location) || location.length === 0) {
    return "";
  }

  const parts = location
    .filter(
      (part): part is string | number =>
        typeof part === "string" || typeof part === "number",
    )
    .map((part) => String(part))
    .filter((part) => part !== "body");

  if (parts.length === 0) {
    return "";
  }

  return parts.join(".");
}

function formatValidationErrors(detail: unknown): string | null {
  if (!Array.isArray(detail)) {
    return null;
  }

  const messages = detail
    .map((entry): string | null => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const validationError = entry as ValidationErrorEntry;

      if (
        typeof validationError.msg !== "string" ||
        !validationError.msg.trim()
      ) {
        return null;
      }

      const message = validationError.msg.trim();
      const location = formatValidationLocation(
        validationError.loc,
      );

      return location
        ? `${location}: ${message}`
        : message;
    })
    .filter(
      (message): message is string =>
        message !== null,
    );

  if (messages.length === 0) {
    return null;
  }

  return messages.join(" ");
}

function getPayloadMessage(
  payload: unknown,
): string | null {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as ApiErrorPayload;

  const validationMessage = formatValidationErrors(
    record.detail,
  );

  if (validationMessage) {
    return validationMessage;
  }

  if (
    typeof record.detail === "string" &&
    record.detail.trim()
  ) {
    return record.detail.trim();
  }

  if (
    typeof record.message === "string" &&
    record.message.trim()
  ) {
    return record.message.trim();
  }

  return null;
}

export function getApiErrorMessage(
  error: unknown,
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message.trim()) {
      return error.message;
    }

    return "Something went wrong while communicating with TrackIt.";
  }

  return "Something went wrong while communicating with TrackIt.";
}

export function getApiErrorPayloadMessage(
  payload: unknown,
): string | null {
  return getPayloadMessage(payload);
}
