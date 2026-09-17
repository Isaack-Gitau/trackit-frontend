import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { resetPassword } from "../../api/auth";
import { ApiError } from "../../api/errors";
import { Button } from "../../components/ui/Button";

type PasswordRequirements = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
};

function getPasswordRequirements(
  password: string,
): PasswordRequirements {
  return {
    length: password.length >= 8 && password.length <= 128,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

function isStrongPassword(password: string): boolean {
  return Object.values(getPasswordRequirements(password)).every(
    Boolean,
  );
}

function getResetErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "We could not reset your password right now. Please try again.";
  }

  if (error.status === 400) {
    return "This password reset link is invalid or has expired. Please request a new reset link.";
  }

  if (error.status === 422) {
    return "Your password does not meet TrackIt's security requirements. Please choose a stronger password.";
  }

  if (error.status === 429) {
    return "Too many password-reset attempts. Please wait a moment and try again.";
  }

  if (error.status >= 500) {
    return "TrackIt is temporarily unable to reset your password. Please try again shortly.";
  }

  return (
    error.message ||
    "We could not reset your password right now. Please try again."
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token")?.trim() ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  const passwordRequirements =
    getPasswordRequirements(password);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  useEffect(() => {
    if (!token) {
      setErrorMessage(
        "This password reset link is missing or invalid. Please request a new reset link.",
      );
    }
  }, [token]);

  useEffect(() => {
    return () => {
      // Prevent a pending redirect timer from firing after unmount.
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (resetCompleted) {
      return;
    }

    if (!token) {
      setErrorMessage(
        "This password reset link is missing or invalid. Please request a new reset link.",
      );
      return;
    }

    if (!isStrongPassword(password)) {
      setErrorMessage(
        "Your password does not meet TrackIt's security requirements. Please check the requirements below.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        token,
        new_password: password,
      });

      setResetCompleted(true);
      setSuccessMessage(
        "Your password has been reset successfully. Redirecting you to sign in...",
      );
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);

      window.setTimeout(() => {
        navigate("/sign-in", { replace: true });
      }, 1800);
    } catch (error) {
      setErrorMessage(getResetErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--trackit-midnight)] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/20 lg:grid-cols-[1fr_1.05fr]">
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
                Account security
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight xl:text-5xl">
                Set a new password and get back to TrackIt.
              </h1>

              <p className="mt-6 text-base leading-8 text-[var(--trackit-text-on-dark)]">
                Choose a strong password that you can use to
                securely access your TrackIt account again.
              </p>
            </div>
          </div>

          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-sm font-semibold text-white">
              Secure account recovery
            </p>

            <p className="mt-1 text-sm leading-6 text-white/60">
              Password reset links are temporary and can only be
              used once.
            </p>
          </div>
        </section>

        <section className="bg-white p-6 sm:p-10 lg:p-12 xl:p-14">
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
                Reset password
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--trackit-navy)]">
                Create a new password
              </h2>

              <p className="mt-3 text-[var(--trackit-text-muted)]">
                Choose a strong password to secure your TrackIt
                account.
              </p>
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div
                role="status"
                className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
              >
                {successMessage}
              </div>
            ) : null}

            {!resetCompleted ? (
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
                noValidate
              >
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-semibold text-[var(--trackit-navy)]"
                  >
                    New password
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="new-password"
                      name="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      required
                      minLength={8}
                      maxLength={128}
                      disabled={isSubmitting}
                      className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 pr-24 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                      placeholder="Enter your new password"
                      aria-invalid={
                        password.length > 0 &&
                        !isStrongPassword(password)
                      }
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
                          ? "Hide new password"
                          : "Show new password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-semibold text-[var(--trackit-navy)]"
                  >
                    Confirm new password
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      required
                      minLength={8}
                      maxLength={128}
                      disabled={isSubmitting}
                      className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 pr-24 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                      placeholder="Enter your new password again"
                      aria-invalid={
                        confirmPassword.length > 0 &&
                        !passwordsMatch
                      }
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (visible) => !visible,
                        )
                      }
                      disabled={isSubmitting}
                      className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-3 text-sm font-semibold !text-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-50"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password confirmation"
                          : "Show password confirmation"
                      }
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {confirmPassword.length > 0 &&
                  password !== confirmPassword ? (
                    <p className="mt-2 text-xs leading-5 text-red-700">
                      The passwords do not match.
                    </p>
                  ) : null}
                </div>

                <div className="rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-4 py-4">
                  <p className="text-sm font-bold text-[var(--trackit-navy)]">
                    Password requirements
                  </p>

                  <ul className="mt-3 space-y-2 text-sm">
                    <li
                      className={
                        passwordRequirements.length
                          ? "text-emerald-700"
                          : "text-[var(--trackit-text-muted)]"
                      }
                    >
                      {passwordRequirements.length ? "✓" : "•"}{" "}
                      8–128 characters
                    </li>

                    <li
                      className={
                        passwordRequirements.uppercase
                          ? "text-emerald-700"
                          : "text-[var(--trackit-text-muted)]"
                      }
                    >
                      {passwordRequirements.uppercase ? "✓" : "•"}{" "}
                      At least one uppercase letter
                    </li>

                    <li
                      className={
                        passwordRequirements.lowercase
                          ? "text-emerald-700"
                          : "text-[var(--trackit-text-muted)]"
                      }
                    >
                      {passwordRequirements.lowercase ? "✓" : "•"}{" "}
                      At least one lowercase letter
                    </li>

                    <li
                      className={
                        passwordRequirements.number
                          ? "text-emerald-700"
                          : "text-[var(--trackit-text-muted)]"
                      }
                    >
                      {passwordRequirements.number ? "✓" : "•"}{" "}
                      At least one number
                    </li>

                    <li
                      className={
                        passwordRequirements.special
                          ? "text-emerald-700"
                          : "text-[var(--trackit-text-muted)]"
                      }
                    >
                      {passwordRequirements.special ? "✓" : "•"}{" "}
                      At least one special character
                    </li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isSubmitting}
                  disabled={
                    !token ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    !isStrongPassword(password)
                  }
                  className="!text-white"
                >
                  Reset password
                </Button>
              </form>
            ) : null}

            <div className="mt-8 border-t border-[var(--trackit-border)] pt-7 text-center">
              <p className="text-sm text-[var(--trackit-text-muted)]">
                Remembered your password?
              </p>

              <Link
                to="/sign-in"
                className="mt-2 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                Back to sign in
              </Link>
            </div>

            {!resetCompleted ? (
              <p className="mt-8 text-center text-xs leading-5 text-[var(--trackit-text-muted)]">
                Need another reset link?{" "}
                <Link
                  to="/forgot-password"
                  className="font-semibold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)]"
                >
                  Request a new one
                </Link>
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

