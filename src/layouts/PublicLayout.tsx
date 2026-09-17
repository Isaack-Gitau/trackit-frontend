import { Outlet } from "react-router-dom";

import { BackToTop } from "../components/navigation/BackToTop";
import { ScrollToTop } from "../components/navigation/ScrollToTop";
import { PublicFooter } from "../components/public/PublicFooter";
import { PublicNavbar } from "../components/public/PublicNavbar";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--trackit-surface)] text-[var(--trackit-text)]">
      <ScrollToTop />

      <PublicNavbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter />

      <BackToTop />
    </div>
  );
}
