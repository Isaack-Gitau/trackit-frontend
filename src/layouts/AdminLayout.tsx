import { Outlet } from "react-router-dom";

import { AdminNavbar } from "../components/navigation/AdminNavbar";
import { BackToTop } from "../components/navigation/BackToTop";
import { ScrollToTop } from "../components/navigation/ScrollToTop";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-[var(--trackit-surface)] text-[var(--trackit-text)]">
      <ScrollToTop />

      <AdminNavbar />

      <main>
        <Outlet />
      </main>

      <BackToTop />
    </div>
  );
}
