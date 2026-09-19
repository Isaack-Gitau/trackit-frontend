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

import { AboutPage } from "./pages/public/AboutPage";
import { ContactPage } from "./pages/public/ContactPage";
import { DiscoverPage } from "./pages/public/DiscoverPage";
import { HelpPage } from "./pages/public/HelpPage";
import { HowItWorksPage } from "./pages/public/HowItWorksPage";
import { LandingPage } from "./pages/public/LandingPage";
import { PrivacyPage } from "./pages/public/PrivacyPage";
import { ItemDetailsPage } from "./pages/public/ItemDetailsPage";
import { PublicProfilePage } from "./pages/public/PublicProfilePage";
import { ProfilePage } from "./pages/app/ProfilePage";
import { SettingsPage } from "./pages/app/SettingsPage";
import { SafetyPage } from "./pages/public/SafetyPage";
import { TermsPage } from "./pages/public/TermsPage";

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
    element: <PublicLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/discover",
        element: <DiscoverPage />,
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
            element: <PlaceholderPage title="Dashboard" />,
          },
          {
            path: "/items",
            element: <PlaceholderPage title="My items" />,
          },
          {
            path: "/items/report-lost",
            element: <PlaceholderPage title="Report lost item" />,
          },
          {
            path: "/items/report-found",
            element: <PlaceholderPage title="Report found item" />,
          },
          {
            path: "/claims",
            element: <PlaceholderPage title="Claims" />,
          },
          {
            path: "/matches",
            element: <PlaceholderPage title="Matches" />,
          },
          {
            path: "/notifications",
            element: <PlaceholderPage title="Notifications" />,
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
            element: <PlaceholderPage title="Moderator area" />,
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
