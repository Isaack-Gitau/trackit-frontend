import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { LoadingScreen } from "../ui/LoadingScreen";

function AuthLoadingState() {
  return <LoadingScreen />;
}

export function RequireAuth() {
  const { status, isAuthenticated } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <AuthLoadingState />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/sign-in"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}

export function RequireModerator() {
  const { status, isAuthenticated, user } = useAuth();

  if (status === "loading") {
    return <AuthLoadingState />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (user.role !== "moderator" && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { status, isAuthenticated, user } = useAuth();

  if (status === "loading") {
    return <AuthLoadingState />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

