import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  loginUser,
} from "../api/auth";
import {
  subscribeToAuthInvalidation,
} from "../api/authEvents";
import { ApiError } from "../api/errors";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  storeAccessToken,
} from "../utils/authStorage";
import type {
  AuthenticatedUser,
  UserLoginRequest,
} from "../types/auth";

export type UserRole = "user" | "moderator" | "admin";

type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

type AuthContextValue = {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (
    credentials: UserLoginRequest,
    allowedRole?: UserRole,
  ) => Promise<AuthenticatedUser>;
  logout: () => void;
  refreshUser: () => Promise<AuthenticatedUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

function getPortalLoginError(role: UserRole): ApiError {
  switch (role) {
    case "admin":
      return new ApiError(
        "This sign-in portal is restricted to authorized administrators.",
        403,
      );

    case "moderator":
      return new ApiError(
        "This sign-in portal is restricted to authorized moderators.",
        403,
      );

    case "user":
    default:
      return new ApiError(
        "This sign-in portal is for regular TrackIt accounts. Please use the appropriate sign-in portal.",
        403,
      );
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    null,
  );
  const [status, setStatus] = useState<AuthStatus>("loading");

  const clearSession = useCallback(() => {
    clearStoredAccessToken();
    setAccessToken(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  useEffect(() => {
    return subscribeToAuthInvalidation((failedAccessToken) => {
      const currentStoredToken = getStoredAccessToken();

      if (
        currentStoredToken !== null &&
        currentStoredToken === failedAccessToken
      ) {
        clearSession();
      }
    });
  }, [clearSession]);

  const refreshUser = useCallback(async (): Promise<AuthenticatedUser | null> => {
    const token = getStoredAccessToken();

    if (!token) {
      setAccessToken(null);
      setUser(null);
      setStatus("unauthenticated");
      return null;
    }

    setAccessToken(token);

    try {
      const currentUser = await getCurrentUser(token);

      if (!currentUser.is_active) {
        clearSession();
        return null;
      }

      setUser(currentUser);
      setStatus("authenticated");

      return currentUser;
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        clearSession();
        return null;
      }

      setStatus("authenticated");

      throw error;
    }
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const token = getStoredAccessToken();

      if (!token) {
        if (!cancelled) {
          setStatus("unauthenticated");
        }
        return;
      }

      if (!cancelled) {
        setAccessToken(token);
      }

      try {
        const currentUser = await getCurrentUser(token);

        if (cancelled) {
          return;
        }

        if (!currentUser.is_active) {
          clearSession();
          return;
        }

        setUser(currentUser);
        setStatus("authenticated");
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (
          error instanceof ApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          clearSession();
          return;
        }

        /*
         * Preserve the stored token when the failure is not an
         * authentication failure. This prevents a temporary network
         * or backend availability problem from unnecessarily logging
         * the user out.
         */
        setStatus("unauthenticated");
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(
    async (
      credentials: UserLoginRequest,
      allowedRole?: UserRole,
    ): Promise<AuthenticatedUser> => {
      const tokenResponse = await loginUser(credentials);

      storeAccessToken(tokenResponse.access_token);
      setAccessToken(tokenResponse.access_token);
      setStatus("loading");

      try {
        const currentUser = await getCurrentUser(
          tokenResponse.access_token,
        );

        if (!currentUser.is_active) {
          clearSession();

          throw new ApiError(
            "Your TrackIt account is currently inactive.",
            403,
          );
        }

        if (
          allowedRole !== undefined &&
          currentUser.role !== allowedRole
        ) {
          clearSession();

          throw getPortalLoginError(allowedRole);
        }

        setUser(currentUser);
        setStatus("authenticated");

        return currentUser;
      } catch (error) {
        clearSession();
        throw error;
      }
    },
    [clearSession],
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      status,
      isAuthenticated:
        status === "authenticated" && user !== null,
      login,
      logout,
      refreshUser,
    }),
    [
      user,
      accessToken,
      status,
      login,
      logout,
      refreshUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider.",
    );
  }

  return context;
}
