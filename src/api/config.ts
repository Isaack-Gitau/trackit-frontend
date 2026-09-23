const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

if (!configuredApiBaseUrl) {
  throw new Error(
    "VITE_API_BASE_URL is not configured. Add it to the frontend environment.",
  );
}

const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");

if (
  import.meta.env.PROD &&
  !apiBaseUrl.startsWith("https://")
) {
  throw new Error(
    "Production TrackIt API requests must use HTTPS.",
  );
}

export const API_BASE_URL = apiBaseUrl;

export function getMediaUrl(
  mediaPath: string | null | undefined,
): string | null {
  if (!mediaPath) {
    return null;
  }

  const normalizedPath = mediaPath.trim();

  if (!normalizedPath) {
    return null;
  }

  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    return normalizedPath;
  }

  return `${API_BASE_URL}/${normalizedPath.replace(/^\/+/, "")}`;
}