import { Outlet } from "react-router-dom";

export function ModeratorLayout() {
  return (
    <div className="min-h-screen bg-[var(--trackit-surface)] text-[var(--trackit-text)]">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
