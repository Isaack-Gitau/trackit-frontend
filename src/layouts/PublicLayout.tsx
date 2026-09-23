import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import { AppNavbar } from "../components/navigation/AppNavbar";
import { BackToTop } from "../components/navigation/BackToTop";
import { ScrollToTop } from "../components/navigation/ScrollToTop";
import { PublicFooter } from "../components/public/PublicFooter";
import { PublicNavbar } from "../components/public/PublicNavbar";
import { useAuth } from "../context/AuthContext";

type PublicLayoutProps = {
  children?: ReactNode;
};

export function PublicLayout({
  children,
}: PublicLayoutProps) {
  const {
    isAuthenticated,
    status,
  } = useAuth();

  const showAuthenticatedNavigation =
    status === "authenticated" && isAuthenticated;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--trackit-surface)] text-[var(--trackit-text)]">
      <ScrollToTop />

      {showAuthenticatedNavigation ? (
        <AppNavbar />
      ) : (
        <PublicNavbar />
      )}

      <main className="flex-1">
        {children ?? <Outlet />}
      </main>

      {!showAuthenticatedNavigation ? (
        <PublicFooter />
      ) : null}

      <BackToTop />
    </div>
  );
}
