import { Outlet } from "react-router-dom";

import { AppNavbar } from "../components/navigation/AppNavbar";
import { BackToTop } from "../components/navigation/BackToTop";
import { ScrollToTop } from "../components/navigation/ScrollToTop";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--trackit-surface)] text-[var(--trackit-text)]">
      <ScrollToTop />

      <AppNavbar />

      <main>
        <Outlet />
      </main>

      <BackToTop />
    </div>
  );
}
