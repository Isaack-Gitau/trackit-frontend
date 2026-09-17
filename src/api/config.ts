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
