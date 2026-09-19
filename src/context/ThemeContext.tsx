import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ThemePreference = "system" | "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemePreference) => void;
};

const THEME_STORAGE_KEY = "trackit-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);

function getStoredTheme(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(
    THEME_STORAGE_KEY,
  );

  if (
    storedTheme === "light" ||
    storedTheme === "dark" ||
    storedTheme === "system"
  ) {
    return storedTheme;
  }

  return "system";
}

function getSystemTheme(): "light" | "dark" {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

function applyTheme(resolvedTheme: "light" | "dark") {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<ThemePreference>(getStoredTheme);

  const [resolvedTheme, setResolvedTheme] = useState<
    "light" | "dark"
  >(() => {
    const storedTheme = getStoredTheme();

    return storedTheme === "system"
      ? getSystemTheme()
      : storedTheme;
  });

  const setTheme = useCallback((nextTheme: ThemePreference) => {
    setThemeState(nextTheme);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        THEME_STORAGE_KEY,
        nextTheme,
      );
    }
  }, []);

  useEffect(() => {
    if (theme === "light" || theme === "dark") {
      setResolvedTheme(theme);
      applyTheme(theme);
      return;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const updateSystemTheme = () => {
      const nextTheme = mediaQuery.matches
        ? "dark"
        : "light";

      setResolvedTheme(nextTheme);
      applyTheme(nextTheme);
    };

    updateSystemTheme();

    mediaQuery.addEventListener(
      "change",
      updateSystemTheme,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateSystemTheme,
      );
    };
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [resolvedTheme, setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeProvider.",
    );
  }

  return context;
}
