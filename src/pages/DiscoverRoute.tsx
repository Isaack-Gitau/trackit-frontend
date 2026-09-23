import { AppLayout } from "../layouts/AppLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { AuthenticatedDiscoverPage } from "./app/AuthenticatedDiscoverPage";
import { DiscoverPage } from "./public/DiscoverPage";

import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "../components/ui/LoadingScreen";

export function DiscoverRoute() {
  const { status, isAuthenticated } = useAuth();

  if (status === "loading") {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return (
      <AppLayout>
        <AuthenticatedDiscoverPage />
      </AppLayout>
    );
  }

  return (
    <PublicLayout>
      <DiscoverPage />
    </PublicLayout>
  );
}
