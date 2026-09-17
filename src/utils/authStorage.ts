const ACCESS_TOKEN_KEY = "trackit_access_token";

export function getStoredAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function storeAccessToken(accessToken: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearStoredAccessToken(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}
