import { createBrowserRouter } from "react-router-dom";

import {
  RequireAdmin,
  RequireAuth,
  RequireModerator,
} from "./components/auth/RouteGuards";
import { AdminLayout } from "./layouts/AdminLayout";
import { AppLayout } from "./layouts/AppLayout";
import { ModeratorLayout } from "./layouts/ModeratorLayout";
import { PublicLayout } from "./layouts/PublicLayout";

import { AccountInactivePage } from "./pages/auth/AccountInactivePage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { PortalSignInPage } from "./pages/auth/PortalSignInPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { SignInPage } from "./pages/auth/SignInPage";
import { VerificationRequiredPage } from "./pages/auth/VerificationRequiredPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";

import { DiscoverRoute } from "./pages/DiscoverRoute";
import { AboutPage } from "./pages/public/AboutPage";
import { ContactPage } from "./pages/public/ContactPage";
import { HelpPage } from "./pages/public/HelpPage";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";
import { ItemDetailsPage } from "./pages/public/ItemDetailsPage";
import { LandingPage } from "./pages/public/LandingPage";
import { PrivacyPage } from "./pages/public/PrivacyPage";
import { PublicProfilePage } from "./pages/public/PublicProfilePage";
import { SafetyPage } from "./pages/public/SafetyPage";
import { TermsPage } from "./pages/public/TermsPage";

import { ClaimsPage } from "./pages/app/ClaimsPage";
import { DashboardPage } from "./pages/app/DashboardPage";
import { MyItemsPage } from "./pages/app/MyItemsPage";
import { MatchesPage } from "./pages/app/MatchesPage";
import { ModeratorItemsPage } from "./pages/app/ModeratorItemsPage";
import { ModeratorOverviewPage } from "./pages/app/ModeratorOverviewPage";
import { ModeratorClaimsPage } from "./pages/app/ModeratorClaimsPage";
import { ModeratorReportsPage } from "./pages/app/ModeratorReportsPage";
import { NotificationsPage } from "./pages/app/NotificationsPage";
import { ReportsPage } from "./pages/app/ReportsPage";
import { PostItemPage } from "./pages/app/PostItemPage";
import { ProfilePage } from "./pages/app/ProfilePage";
import { SettingsPage } from "./pages/app/SettingsPage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="min-h-[60vh] bg-[var(--trackit-surface)] px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
          TrackIt
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
          {title}
        </h1>

        <p className="mt-4 max-w-2xl text-[var(--trackit-text-muted)]">
          This TrackIt route is reserved for the next implementation phase.
        </p>
      </div>
    </main>
  );
}

export const router = createBrowserRouter([
  {
    path: "/discover",
    element: <DiscoverRoute />,
  },

  {
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/items/:itemId",
        element: <ItemDetailsPage />,
      },
      {
        path: "/how-it-works",
        element: <HowItWorksPage />,
      },
      {
        path: "/safety",
        element: <SafetyPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/help",
        element: <HelpPage />,
      },
      {
        path: "/privacy",
        element: <PrivacyPage />,
      },
      {
        path: "/terms",
        element: <TermsPage />,
      },
    ],
  },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          {
            path: "/users/:userId",
            element: <PublicProfilePage />,
          },
        ],
      },
    ],
  },

  {
    path: "/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/moderator/sign-in",
    element: <PortalSignInPage role="moderator" />,
  },
  {
    path: "/admin/sign-in",
    element: <PortalSignInPage role="admin" />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/verification-required",
    element: <VerificationRequiredPage />,
  },
  {
    path: "/account-inactive",
    element: <AccountInactivePage />,
  },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/items",
            element: <MyItemsPage />,
          },
          {
            path: "/items/post-lost",
            element: <PostItemPage type="lost" />,
          },
          {
            path: "/items/post-found",
            element: <PostItemPage type="found" />,
          },
          {
            path: "/claims",
            element: <ClaimsPage />,
          },
          {
            path: "/matches",
            element: <MatchesPage />,
          },
          {
            path: "/notifications",
            element: <NotificationsPage />,
          },
          {
            path: "/reports",
            element: <ReportsPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
          {
            path: "/settings",
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },

  {
    element: <RequireModerator />,
    children: [
      {
        element: <ModeratorLayout />,
        children: [
          {
            path: "/moderator",
            element: <ModeratorOverviewPage />,
          },
          {
            path: "/moderator/items",
            element: <ModeratorItemsPage />,
          },
          {
            path: "/moderator/claims",
            element: <ModeratorClaimsPage />,
          },
          {
            path: "/moderator/reports",
            element: <ModeratorReportsPage />,
          },
        ],
      },
    ],
  },

  {
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "/admin",
            element: <PlaceholderPage title="Admin area" />,
          },
        ],
      },
    ],
  },
]);