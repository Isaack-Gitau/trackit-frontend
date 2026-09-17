import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { Button } from "../ui/Button";

const navigation = [
  { label: "Discover", to: "/discover" },
  { label: "How it works", to: "/how-it-works" },
  { label: "Safety", to: "/safety" },
  { label: "About TrackIt", to: "/about" },
];

export function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[var(--trackit-midnight)]/95 text-white shadow-lg backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:h-[72px] lg:px-8">
        {/* Brand */}
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="TrackIt home"
          className="flex min-h-11 items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Track
            <span className="text-[var(--trackit-blue-bright)]">It</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-[var(--trackit-text-on-dark)] hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/sign-in"
            className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold text-[var(--trackit-text-on-dark)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
          >
            Sign in
          </Link>

          <Button
            href="/register"
            variant="primary"
            size="sm"
            className="!text-white"
          >
            Start with TrackIt
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="relative lg:hidden">
          <button
            type="button"
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
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
              id="mobile-navigation"
              className="absolute right-0 top-[calc(100%+0.65rem)] w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[var(--trackit-deep-navy)] p-2 shadow-2xl shadow-black/30"
            >
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col"
              >
                {navigation.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      [
                        "rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-[var(--trackit-text-on-dark)] hover:bg-white/5 hover:text-white",
                      ].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                {/* Mobile account actions */}
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 p-2 pt-3">
                  <Link
                    to="/sign-in"
                    onClick={closeMenu}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-white/15 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    Sign in
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    Start
                  </Link>
                </div>
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

