import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { ApiError } from "../../api/errors";
import { Button } from "../../components/ui/Button";
import {
  type UserRole,
  useAuth,
} from "../../context/AuthContext";

type SignInLocationState = {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
};

type PortalConfig = {
  role: UserRole;
  eyebrow: string;
  title: string;
  description: string;
  welcomeTitle: string;
  welcomeDescription: string;
  destination: string;
};

const PORTAL_CONFIG: Record<UserRole, PortalConfig> = {
  user: {
    role: "user",
    eyebrow: "Sign in",
    title: "Welcome back to TrackIt",
    description:
      "Use your username or email address to continue.",
    welcomeTitle:
      "Keep your lost-and-found journey moving.",
    welcomeDescription:
      "Sign in to report items, follow claims, review matches, receive notifications, and stay connected with the TrackIt community.",
    destination: "/dashboard",
  },

  moderator: {
    role: "moderator",
    eyebrow: "Moderator access",
    title: "Sign in to the moderator portal",
    description:
      "Use your authorized TrackIt moderator account to continue.",
    welcomeTitle:
      "Help keep the TrackIt community organized.",
    welcomeDescription:
      "Moderator access is reserved for authorized TrackIt moderators responsible for reviewing and managing community activity.",
    destination: "/moderator",
  },

  admin: {
    role: "admin",
    eyebrow: "Administrator access",
    title: "Sign in to the administrator portal",
    description:
      "Use your authorized TrackIt administrator account to continue.",
    welcomeTitle:
      "Manage TrackIt with care and accountability.",
    welcomeDescription:
      "Administrator access provides elevated tools for platform management, account administration, moderation oversight, and audit activity.",
    destination: "/admin",
  },
};

type PortalSignInPageProps = {
  role: UserRole;
};

function getLoginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "We could not sign you in right now. Please try again.";
  }

  if (
    error.status === 403 &&
    error.message ===
      "Your TrackIt account is currently inactive."
  ) {
    return "Your TrackIt account is currently inactive.";
  }

  if (error.status === 403) {
    return error.message;
  }

  if (error.status === 401) {
    return "Invalid credentials or account not eligible for login.";
  }

  if (error.status === 429) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }

  if (error.status >= 500) {
    return "TrackIt is temporarily unable to sign you in. Please try again shortly.";
  }

  return (
    error.message ||
    "We could not sign you in right now. Please try again."
  );
}

export function PortalSignInPage({
  role,
}: PortalSignInPageProps) {
  const config = PORTAL_CONFIG[role];

  const { login, isAuthenticated, status, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      !isAuthenticated ||
      !user
    ) {
      return;
    }

    if (user.role === role) {
      navigate(config.destination, { replace: true });
    }
  }, [
    config.destination,
    isAuthenticated,
    navigate,
    role,
    status,
    user,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedIdentifier = identifier.trim();

    if (!normalizedIdentifier || !password) {
      setErrorMessage(
        "Enter your username or email address and password.",
      );
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await login(
        {
          identifier: normalizedIdentifier,
          password,
        },
        role,
      );

      const state =
        location.state as SignInLocationState | null;
      const from = state?.from;

      const destination =
        role === "user" && from?.pathname
          ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
          : config.destination;

      navigate(destination, { replace: true });
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isPrivilegedPortal =
    role === "moderator" || role === "admin";

  const inputClasses =
    "mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-input-border)] bg-[var(--trackit-input-surface)] px-4 text-[var(--trackit-navy)] placeholder:text-[var(--trackit-text-muted)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-[var(--trackit-surface-blue)]";

  const passwordInputClasses =
    "min-h-12 w-full rounded-xl border border-[var(--trackit-input-border)] bg-[var(--trackit-input-surface)] px-4 pr-24 text-[var(--trackit-navy)] placeholder:text-[var(--trackit-text-muted)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-[var(--trackit-surface-blue)]";

  return (
    <main className="min-h-screen bg-[var(--trackit-midnight)] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-2xl shadow-black/20 lg:grid-cols-[1fr_1.05fr]">
        <section className="hidden bg-[var(--trackit-deep-navy)] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div>
            <Link
              to="/"
              className="inline-flex rounded-lg text-2xl font-extrabold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              Track
              <span className="text-[var(--trackit-blue-bright)]">
                It
              </span>
            </Link>

            <div className="mt-20 max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
                {config.eyebrow}
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight xl:text-5xl">
                {config.welcomeTitle}
              </h1>

              <p className="mt-6 text-base leading-8 text-[var(--trackit-text-on-dark)]">
                {config.welcomeDescription}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {isPrivilegedPortal ? (
              <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-sm font-semibold text-white">
                  Restricted access
                </p>

                <p className="mt-1 text-sm leading-6 text-white/60">
                  This portal is not linked from the public TrackIt
                  interface.
                </p>
              </div>
            ) : null}

            <p className="max-w-md text-sm leading-6 text-white/60">
              TrackIt is built around clear information,
              responsible verification, and safer returns.
            </p>
          </div>
        </section>

        <section className="bg-[var(--trackit-surface)] p-6 sm:p-10 lg:p-12 xl:p-14">
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden">
              <Link
                to="/"
                className="inline-flex rounded-lg text-xl font-extrabold tracking-tight text-[var(--trackit-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                Track
                <span className="text-[var(--trackit-blue)]">
                  It
                </span>
              </Link>
            </div>

            <div className="mt-8 lg:mt-0">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
                {config.eyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--trackit-navy)]">
                {config.title}
              </h2>

              <p className="mt-3 text-[var(--trackit-text-muted)]">
                {config.description}
              </p>
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="mt-7 rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-4 py-3 text-sm leading-6 text-[var(--trackit-danger-text)]"
              >
                {errorMessage}
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
              noValidate
            >
              <div>
                <label
                  htmlFor={`${role}-identifier`}
                  className="block text-sm font-semibold text-[var(--trackit-navy)]"
                >
                  Username or email
                </label>

                <input
                  id={`${role}-identifier`}
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => {
                    setIdentifier(event.target.value);
                    setErrorMessage("");
                  }}
                  required
                  minLength={3}
                  maxLength={255}
                  disabled={isSubmitting}
                  className={inputClasses}
                  placeholder="Enter your username or email"
                  aria-invalid={
                    identifier.length > 0 &&
                    identifier.trim().length < 3
                  }
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <label
                    htmlFor={`${role}-password`}
                    className="block text-sm font-semibold text-[var(--trackit-navy)]"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-semibold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative mt-2">
                  <input
                    id={`${role}-password`}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrorMessage("");
                    }}
                    required
                    minLength={1}
                    maxLength={128}
                    disabled={isSubmitting}
                    className={passwordInputClasses}
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((visible) => !visible)
                    }
                    disabled={isSubmitting}
                    className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-3 text-sm font-semibold !text-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={!identifier.trim() || !password}
                className="!text-white"
              >
                Sign in
              </Button>
            </form>

            {role === "user" ? (
              <div className="mt-8 border-t border-[var(--trackit-border)] pt-7 text-center">
                <p className="text-sm text-[var(--trackit-text-muted)]">
                  Don't have a TrackIt account?
                </p>

                <Link
                  to="/register"
                  className="mt-2 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Create your account
                </Link>
              </div>
            ) : null}

            <p className="mt-8 text-center text-xs leading-5 text-[var(--trackit-text-muted)]">
              By continuing, you agree to use TrackIt responsibly
              and follow our{" "}
              <Link
                to="/terms"
                className="font-semibold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)]"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="font-semibold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)]"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
