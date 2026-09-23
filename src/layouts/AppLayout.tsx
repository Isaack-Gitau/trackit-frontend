import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import { AppNavbar } from "../components/navigation/AppNavbar";
import { BackToTop } from "../components/navigation/BackToTop";
import { ScrollToTop } from "../components/navigation/ScrollToTop";

type AppLayoutProps = {
  children?: ReactNode;
};

export function AppLayout({
  children,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--trackit-surface)] text-[var(--trackit-text)]">
      <ScrollToTop />

      <AppNavbar />

      <main>
        {children ?? <Outlet />}
      </main>

      <BackToTop />
    </div>
  );
}