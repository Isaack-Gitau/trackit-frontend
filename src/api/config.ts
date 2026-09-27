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

/**
 * Resolve a backend image value into a browser-accessible URL.
 *
 * The backend stores uploaded images as relative storage keys such as:
 *
 *   items/abc123.webp
 *   profiles/abc123.webp
 *
 * The public static media endpoint is mounted at /media, so those
 * storage keys must be resolved to:
 *
 *   /media/items/abc123.webp
 *   /media/profiles/abc123.webp
 *
 * The helper also accepts already-public media paths and absolute URLs
 * so it remains safe for existing API values and future API changes.
 */
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

  const path = normalizedPath.replace(/^\/+/, "");

  if (path === "media") {
    return `${API_BASE_URL}/media`;
  }

  if (path.startsWith("media/")) {
    return `${API_BASE_URL}/${path}`;
  }

  if (
    path.startsWith("items/") ||
    path.startsWith("profiles/")
  ) {
    return `${API_BASE_URL}/media/${path}`;
  }

  return `${API_BASE_URL}/${path}`;
}
