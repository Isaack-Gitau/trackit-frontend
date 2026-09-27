import { useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

const navigation = [
  {
    label: "Overview",
    to: "/admin",
  },
  {
    label: "Users",
    to: "/admin/users",
  },
  {
    label: "Moderation",
    to: "/admin/moderation",
  },
  {
    label: "Email",
    to: "/admin/email",
  },
];

function isNavigationItemActive(
  itemTo: string,
  pathname: string,
): boolean {
  if (itemTo === "/admin") {
    return pathname === "/admin";
  }

  return (
    pathname === itemTo ||
    pathname.startsWith(`${itemTo}/`)
  );
}

export function AdminNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
        <div className="flex min-w-0 items-center gap-4">
          <Link
            to="/admin"
            onClick={closeMenu}
            aria-label="TrackIt Admin"
            className="flex min-h-11 shrink-0 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
          >
            <span className="text-xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-2xl">
              Track
              <span className="text-[var(--trackit-blue)]">
                It
              </span>
            </span>
          </Link>

          <span className="hidden h-7 w-px bg-[var(--trackit-border)] sm:block" />

          <span className="hidden text-sm font-bold text-[var(--trackit-text-muted)] sm:block">
            Administration
          </span>
        </div>

        <nav
          aria-label="Administrator navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={() => {
                const active = isNavigationItemActive(
                  item.to,
                  location.pathname,
                );

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

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/discover"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[var(--trackit-text-muted)] transition-colors hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
          >
            TrackIt
          </Link>

          <div className="h-8 w-px bg-[var(--trackit-border)]" />

          <span
            className="max-w-32 truncate text-sm font-semibold text-[var(--trackit-navy)]"
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

        <div className="relative lg:hidden">
          <button
            type="button"
            aria-label={
              isMenuOpen
                ? "Close administrator navigation"
                : "Open administrator navigation"
            }
            aria-expanded={isMenuOpen}
            aria-controls="admin-mobile-navigation"
            onClick={() =>
              setIsMenuOpen((open) => !open)
            }
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-[var(--trackit-border)] bg-[var(--trackit-surface)] text-[var(--trackit-navy)] transition-colors hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
          >
            <span className="sr-only">
              {isMenuOpen
                ? "Close menu"
                : "Open menu"}
            </span>

            <span
              className="flex w-5 flex-col gap-1.5"
              aria-hidden="true"
            >
              <span
                className={[
                  "h-0.5 w-full rounded-full bg-current transition-transform duration-200",
                  isMenuOpen
                    ? "translate-y-2 rotate-45"
                    : "",
                ].join(" ")}
              />

              <span
                className={[
                  "h-0.5 w-full rounded-full bg-current transition-opacity duration-200",
                  isMenuOpen
                    ? "opacity-0"
                    : "",
                ].join(" ")}
              />

              <span
                className={[
                  "h-0.5 w-full rounded-full bg-current transition-transform duration-200",
                  isMenuOpen
                    ? "-translate-y-2 -rotate-45"
                    : "",
                ].join(" ")}
              />
            </span>
          </button>

          {isMenuOpen ? (
            <div
              id="admin-mobile-navigation"
              className="absolute right-0 top-[calc(100%+0.65rem)] w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-2 shadow-2xl"
            >
              <nav
                aria-label="Mobile administrator navigation"
                className="flex flex-col"
              >
                <div className="mb-2 rounded-xl bg-[var(--trackit-surface-blue)] px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
                    Administrator
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-[var(--trackit-navy)]">
                    {user?.username}
                  </p>
                </div>

                {navigation.map((item) => {
                  const active = isNavigationItemActive(
                    item.to,
                    location.pathname,
                  );

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === "/admin"}
                      onClick={closeMenu}
                      className={[
                        "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
                        active
                          ? "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]"
                          : "text-[var(--trackit-text)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)]",
                      ].join(" ")}
                    >
                      {item.label}
                    </NavLink>
                  );
                })}

                <div className="mt-2 border-t border-[var(--trackit-border)] pt-2">
                  <Link
                    to="/discover"
                    onClick={closeMenu}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-[var(--trackit-text)] transition-colors hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    Return to TrackIt
                  </Link>
                </div>

                <div className="mt-2 border-t border-[var(--trackit-border)] px-2 pt-3">
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
