import { useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useUnreadNotificationCount } from "../../hooks/useNotifications";
import { Button } from "../ui/Button";

const navigation = [
  { label: "Discover", to: "/discover" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Post", to: "/items/post-lost" },
  { label: "My Items", to: "/items" },
  { label: "Claims", to: "/claims" },
  { label: "Matches", to: "/matches" },
  { label: "Reports", to: "/reports" },
];

const accountNavigation = [
  { label: "Profile", to: "/profile" },
  { label: "Settings", to: "/settings" },
];

function NotificationBell({
  unreadCount,
}: {
  unreadCount: number;
}) {
  const hasUnread = unreadCount > 0;

  return (
    <Link
      to="/notifications"
      aria-label={
        hasUnread
          ? `${unreadCount} unread notifications`
          : "Notifications"
      }
      className={[
        "relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg",
        "text-[var(--trackit-navy)] transition-colors",
        "hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>

      {hasUnread ? (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[var(--trackit-blue)] px-1 text-[10px] font-extrabold leading-none !text-white ring-2 ring-[var(--trackit-surface)]"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}

function MobileNotificationNavLabel({
  unreadCount,
}: {
  unreadCount: number;
}) {
  return (
    <span className="flex items-center justify-between gap-3">
      <span>Notifications</span>

      {unreadCount > 0 ? (
        <span
          aria-label={`${unreadCount} unread notifications`}
          className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--trackit-blue)] px-1.5 py-0.5 text-[11px] font-extrabold leading-none !text-white"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      ) : null}
    </span>
  );
}

function isNavigationItemActive(
  itemTo: string,
  pathname: string,
): boolean {
  if (itemTo === "/items/post-lost") {
    return (
      pathname === "/items/post-lost" ||
      pathname === "/items/post-found" ||
      pathname.startsWith("/items/post-lost/") ||
      pathname.startsWith("/items/post-found/")
    );
  }

  if (itemTo === "/items") {
    return pathname === "/items";
  }

  return pathname === itemTo || pathname.startsWith(`${itemTo}/`);
}

export function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { accessToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: unreadCountData } =
    useUnreadNotificationCount(accessToken);

  const unreadCount = unreadCountData?.unread_count ?? 0;

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/sign-in", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--trackit-border)] bg-[var(--trackit-surface)]/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-6 lg:min-h-[72px] lg:px-8">
        <Link
          to="/discover"
          onClick={closeMenu}
          aria-label="TrackIt Discover"
          className="flex min-h-11 shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <span className="text-xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-2xl">
            Track
            <span className="text-[var(--trackit-blue)]">It</span>
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 xl:flex"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/items"}
              className={({ isActive }) => {
                const active =
                  isNavigationItemActive(
                    item.to,
                    location.pathname,
                  ) || isActive;

                return [
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
                  active
                    ? "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]"
                    : "text-[var(--trackit-text-muted)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)]",
                ].join(" ");
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <NotificationBell unreadCount={unreadCount} />

          <div className="mx-1 h-8 w-px bg-[var(--trackit-border)]" />

          {accountNavigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
                  isActive
                    ? "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]"
                    : "text-[var(--trackit-text-muted)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)]",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="ml-2 h-8 w-px bg-[var(--trackit-border)]" />

          <span
            className="max-w-28 truncate px-2 text-sm font-semibold text-[var(--trackit-navy)]"
            title={user?.username}
          >
            {user?.username}
          </span>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            className="!text-white"
          >
            Logout
          </Button>
        </div>

        <div className="relative xl:hidden">
          <button
            type="button"
            aria-label={
              isMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            aria-controls="app-mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--trackit-border)] bg-[var(--trackit-surface)] text-[var(--trackit-navy)] transition-colors hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
          >
            <span className="sr-only">
              {isMenuOpen ? "Close menu" : "Open menu"}
            </span>

            <span
              className="flex w-5 flex-col gap-1.5"
              aria-hidden="true"
            >
              <span
                className={[
                  "h-0.5 w-full rounded-full bg-current transition-transform duration-200",
                  isMenuOpen ? "translate-y-2 rotate-45" : "",
                ].join(" ")}
              />

              <span
                className={[
                  "h-0.5 w-full rounded-full bg-current transition-opacity duration-200",
                  isMenuOpen ? "opacity-0" : "",
                ].join(" ")}
              />

              <span
                className={[
                  "h-0.5 w-full rounded-full bg-current transition-transform duration-200",
                  isMenuOpen ? "-translate-y-2 -rotate-45" : "",
                ].join(" ")}
              />
            </span>
          </button>

          {isMenuOpen ? (
            <div
              id="app-mobile-navigation"
              className="absolute right-0 top-[calc(100%+0.65rem)] w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-2 shadow-2xl"
            >
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col"
              >
                {navigation.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/items"}
                    onClick={closeMenu}
                    className={({ isActive }) => {
                      const active =
                        isNavigationItemActive(
                          item.to,
                          location.pathname,
                        ) || isActive;

                      return [
                        "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
                        active
                          ? "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]"
                          : "text-[var(--trackit-text)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)]",
                      ].join(" ");
                    }}
                  >
                    {item.label}
                  </NavLink>
                ))}

                <NavLink
                  to="/notifications"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
                      isActive
                        ? "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]"
                        : "text-[var(--trackit-text)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)]",
                    ].join(" ")
                  }
                >
                  <MobileNotificationNavLabel
                    unreadCount={unreadCount}
                  />
                </NavLink>

                <div className="mt-2 border-t border-[var(--trackit-border)] pt-2">
                  {accountNavigation.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        [
                          "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
                          isActive
                            ? "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]"
                            : "text-[var(--trackit-text)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)]",
                        ].join(" ")
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>

                <div className="mt-2 border-t border-[var(--trackit-border)] px-2 pt-3">
                  <div className="mb-3 rounded-xl bg-[var(--trackit-surface-blue)] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
                      Signed in as
                    </p>

                    <p className="mt-1 truncate text-sm font-bold text-[var(--trackit-navy)]">
                      {user?.username}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    fullWidth
                    onClick={handleLogout}
                    className="!text-white"
                  >
                    Logout
                  </Button>
                </div>
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}