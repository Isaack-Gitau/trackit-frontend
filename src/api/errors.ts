export type ApiErrorPayload = {
  detail?: unknown;
  message?: unknown;
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

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while communicating with TrackIt.";
}
