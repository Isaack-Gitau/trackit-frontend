import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "../../api/errors";
import { deleteAccount } from "../../api/profiles";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import {
  type ThemePreference,
  useTheme,
} from "../../context/ThemeContext";

const THEME_OPTIONS: Array<{
  value: ThemePreference;
  label: string;
  description: string;
}> = [
  {
    value: "system",
    label: "System",
    description: "Follow your device's appearance setting.",
  },
  {
    value: "light",
    label: "Light",
    description: "Use TrackIt's light appearance.",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Use TrackIt's dark appearance.",
  },
];

function getDisplayName(
  firstName: string,
  lastName: string,
  username: string,
): string {
  const name = `${firstName} ${lastName}`.trim();

  return name || username;
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { accessToken, logout, user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState(false);

  async function handleDeleteAccount() {
    if (!currentPassword) {
      setDeleteError("Enter your current password to continue.");
      return;
    }

    setDeleteError("");
    setIsDeleting(true);

    try {
      if (!accessToken) {
        setDeleteError(
          "Your session has expired. Please sign in again.",
        );
        return;
      }

      await deleteAccount(currentPassword, accessToken);

      logout();
      navigate("/", { replace: true });
    } catch (error) {
      setDeleteError(getApiErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  if (!user) {
    return null;
  }

  const displayName = getDisplayName(
    user.first_name,
    user.last_name,
    user.username,
  );

  return (
    <main className="min-h-screen bg-[var(--trackit-surface)] px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/dashboard");
            }
          }}
          className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 py-2 text-sm font-semibold text-[var(--trackit-navy)] shadow-sm transition hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>

        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
            Account settings
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
            Settings
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--trackit-text-muted)]">
            Manage your TrackIt appearance, account security, and
            account access.
          </p>
        </header>

        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                Appearance
              </p>

              <h2 className="mt-2 text-xl font-bold text-[var(--trackit-navy)]">
                Choose how TrackIt looks
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Your preference is stored on this device and does
                not change your TrackIt account.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {THEME_OPTIONS.map((option) => {
                const selected = theme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    aria-pressed={selected}
                    className={[
                      "rounded-xl border p-4 text-left transition",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
                      selected
                        ? "border-[var(--trackit-blue)] bg-[var(--trackit-blue-soft)]"
                        : "border-[var(--trackit-border)] bg-[var(--trackit-surface)] hover:border-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)]",
                    ].join(" ")}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-[var(--trackit-navy)]">
                        {option.label}
                      </span>

                      <span
                        aria-hidden="true"
                        className={[
                          "h-4 w-4 rounded-full border-2",
                          selected
                            ? "border-[var(--trackit-blue)] bg-[var(--trackit-blue)]"
                            : "border-[var(--trackit-border)]",
                        ].join(" ")}
                      />
                    </span>

                    <span className="mt-2 block text-sm leading-5 text-[var(--trackit-text-muted)]">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                Account & security
              </p>

              <h2 className="mt-2 text-xl font-bold text-[var(--trackit-navy)]">
                Your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Review your account details and use the existing
                password recovery flow when you need to reset your
                password.
              </p>
            </div>

            <div className="mt-6 divide-y divide-[var(--trackit-border)] rounded-xl border border-[var(--trackit-border)]">
              <div className="grid gap-1 px-4 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <span className="text-sm font-semibold text-[var(--trackit-navy)]">
                  Name
                </span>

                <span className="text-sm text-[var(--trackit-text-muted)]">
                  {displayName}
                </span>
              </div>

              <div className="grid gap-1 px-4 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <span className="text-sm font-semibold text-[var(--trackit-navy)]">
                  Username
                </span>

                <span className="break-all text-sm text-[var(--trackit-text-muted)]">
                  {user.username}
                </span>
              </div>

              <div className="grid gap-1 px-4 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <span className="text-sm font-semibold text-[var(--trackit-navy)]">
                  Email
                </span>

                <span className="break-all text-sm text-[var(--trackit-text-muted)]">
                  {user.email}
                </span>
              </div>

              <div className="grid gap-1 px-4 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <span className="text-sm font-semibold text-[var(--trackit-navy)]">
                  Verification
                </span>

                <span
                  className={
                    user.is_verified
                      ? "text-sm font-semibold text-[var(--trackit-success)]"
                      : "text-sm font-semibold text-[var(--trackit-warning)]"
                  }
                >
                  {user.is_verified
                    ? "Email verified"
                    : "Email not verified"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--trackit-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-[var(--trackit-navy)]">
                  Password
                </h3>

                <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-muted)]">
                  Reset your password through TrackIt's secure
                  recovery flow.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/forgot-password")}
              >
                Reset password
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-danger)]">
                Danger zone
              </p>

              <h2 className="mt-2 text-xl font-bold text-[var(--trackit-navy)]">
                Delete your account
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--trackit-text-muted)]">
                Permanently delete your TrackIt account and associated
                account data. This action cannot be undone.
              </p>
            </div>

            {!showDeleteConfirmation ? (
              <div className="mt-6">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setDeleteError("");
                    setCurrentPassword("");
                    setShowDeleteConfirmation(true);
                  }}
                >
                  Delete account
                </Button>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-surface-blue)] p-5">
                <h3 className="font-semibold text-[var(--trackit-danger-text)]">
                  Confirm account deletion
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--trackit-danger-text)]">
                  Enter your current password to permanently delete
                  your account.
                </p>

                {deleteError ? (
                  <div
                    role="alert"
                    className="mt-4 rounded-lg border border-[var(--trackit-danger-border)] bg-[var(--trackit-surface)] px-4 py-3 text-sm leading-6 text-[var(--trackit-text)]"
                  >
                    {deleteError}
                  </div>
                ) : null}

                <div className="mt-4">
                  <label
                    htmlFor="delete-account-password"
                    className="block text-sm font-semibold text-[var(--trackit-danger-text)]"
                  >
                    Current password
                  </label>

                  <input
                    id="delete-account-password"
                    name="current-password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => {
                      setCurrentPassword(event.target.value);
                      setDeleteError("");
                    }}
                    disabled={isDeleting}
                    className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-surface)] px-4 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-danger)] focus:ring-2 focus:ring-[var(--trackit-danger)]/20 disabled:cursor-not-allowed disabled:bg-[var(--trackit-surface-blue)] sm:max-w-md"
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => {
                      setShowDeleteConfirmation(false);
                      setCurrentPassword("");
                      setDeleteError("");
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    loading={isDeleting}
                    disabled={!currentPassword}
                    onClick={() => {
                      void handleDeleteAccount();
                    }}
                  >
                    Permanently delete account
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--trackit-text-muted)]">
          Need to change profile details?{" "}
          <Link
            to="/profile"
            className="font-semibold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)]"
          >
            Manage your profile
          </Link>
          .
        </p>
      </div>
    </main>
  );
}