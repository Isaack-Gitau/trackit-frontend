type AuthInvalidationListener = (
  accessToken: string,
) => void;

const listeners = new Set<AuthInvalidationListener>();

export function subscribeToAuthInvalidation(
  listener: AuthInvalidationListener,
): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function notifyAuthInvalidation(
  accessToken: string,
): void {
  for (const listener of listeners) {
    listener(accessToken);
  }
}
