import { Outlet } from "react-router-dom";

import { ModeratorNavbar } from "../components/navigation/ModeratorNavbar";
import { BackToTop } from "../components/navigation/BackToTop";
import { ScrollToTop } from "../components/navigation/ScrollToTop";

export function ModeratorLayout() {
  return (
    <div className="min-h-screen bg-[var(--trackit-surface)] text-[var(--trackit-text)]">
      <ScrollToTop />

      <ModeratorNavbar />

      <main>
        <Outlet />
      </main>

      <BackToTop />
    </div>
  );
}
