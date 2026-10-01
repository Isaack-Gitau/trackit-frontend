import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { getApiErrorMessage } from "../../api/errors";
import {
  useActivateUser,
  useAdminUserDetail,
  useDeactivateUser,
  useDeleteAdminUser,
  useDemoteAdminToModerator,
  usePromoteModeratorToAdmin,
  usePromoteUserToModerator,
  useRevokeModerator,
} from "../../hooks/useAdmin";
import { useAuth } from "../../context/AuthContext";
import type {
  AdminUserRole,
} from "../../types/admin";

function formatDate(
  value: string | null | undefined,
): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function roleLabel(role: AdminUserRole): string {
  switch (role) {
    case "admin":
      return "Administrator";
    case "moderator":
      return "Moderator";
    default:
      return "User";
  }
}

function roleClasses(role: AdminUserRole): string {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-800";
    case "moderator":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        active
          ? "bg-emerald-100 text-emerald-800"
          : "bg-red-100 text-red-800",
      ].join(" ")}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function VerificationBadge({
  verified,
}: {
  verified: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        verified
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
        {label}
      </dt>

      <dd className="mt-1 break-words text-sm leading-6 text-[var(--trackit-text)]">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function getSocialLabel(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function isSafeHttpUrl(
  value: unknown,
): value is string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function SocialLinks({
  links,
}: {
  links: Record<string, unknown>;
}) {
  const socialEntries = Object.entries(links).filter(
    ([, value]) => isSafeHttpUrl(value),
  );

  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
        Social links
      </dt>

      <dd className="mt-3">
        {socialEntries.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {socialEntries.map(([key, value]) => (
              <a
                key={key}
                href={value as string}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-10 items-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-sm font-semibold !text-[var(--trackit-blue)] transition hover:border-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                {getSocialLabel(key)}
              </a>
            ))}
          </div>
        ) : (
          <span className="text-sm leading-6 text-[var(--trackit-text)]">
            None configured
          </span>
        )}
      </dd>
    </div>
  );
}

const privacyPreferenceLabels: Record<string, string> = {
  profile_picture: "Profile picture",
  bio: "Bio",
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  phone_number: "Phone number",
  social_links: "Social links",
};

function formatPreferenceLabel(key: string): string {
  const knownLabel = privacyPreferenceLabels[key];

  if (knownLabel) {
    return knownLabel;
  }

  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function PrivacyPreferenceBadge({
  visible,
}: {
  visible: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex min-w-20 justify-center rounded-full px-3 py-1",
        "text-xs font-semibold",
        visible
          ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      {visible ? "Visible" : "Hidden"}
    </span>
  );
}

function PrivacyPreferences({
  preferences,
}: {
  preferences: Record<string, unknown>;
}) {
  const entries = Object.entries(preferences);

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-4">
        <p className="text-sm font-medium text-[var(--trackit-navy)]">
          No privacy preferences configured
        </p>

        <p className="mt-1 text-sm leading-6 text-[var(--trackit-muted)]">
          This account has not configured any profile visibility
          preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--trackit-border)]">
      <div className="grid grid-cols-[1fr_auto] border-b border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 py-3 sm:px-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
          Information
        </span>

        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
          Visibility
        </span>
      </div>

      <div className="divide-y divide-[var(--trackit-border)]">
        {entries.map(([key, value]) => {
          const visible =
            typeof value === "boolean"
              ? value
              : Boolean(value);

          return (
            <div
              key={key}
              className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 sm:px-5"
            >
              <span className="min-w-0 text-sm font-medium text-[var(--trackit-text)]">
                {formatPreferenceLabel(key)}
              </span>

              <PrivacyPreferenceBadge
                visible={visible}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionError({
  error,
}: {
  error: unknown;
}) {
  if (!error) {
    return null;
  }

  return (
    <div
      className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20"
      role="alert"
    >
      <p className="text-sm font-semibold text-red-900 dark:text-red-200">
        Action could not be completed
      </p>

      <p className="mt-1 text-sm leading-6 text-red-800 dark:text-red-300">
        {getApiErrorMessage(error)}
      </p>
    </div>
  );
}

export function AdminUserDetailPage() {
  const { accessToken, user: currentUser } = useAuth();
  const { userId: userIdParam } = useParams();
  const navigate = useNavigate();

  const parsedUserId = Number(userIdParam);
  const userId =
    Number.isInteger(parsedUserId) && parsedUserId > 0
      ? parsedUserId
      : null;

  const [durationHours, setDurationHours] =
    useState("24");
  const [reason, setReason] = useState("");
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] =
    useState<
      | "promote-user"
      | "promote-moderator"
      | "demote-admin"
      | "revoke-moderator"
      | "deactivate"
      | "activate"
      | "delete-user"
      | null
    >(null);
  const [validationError, setValidationError] =
    useState<string | null>(null);
  const [deactivationPreviewAt, setDeactivationPreviewAt] =
    useState<string | null>(null);

  const detailQuery = useAdminUserDetail(
    userId,
    accessToken,
  );

  const promoteUserMutation =
    usePromoteUserToModerator(accessToken);

  const promoteModeratorMutation =
    usePromoteModeratorToAdmin(accessToken);

  const demoteAdminMutation =
    useDemoteAdminToModerator(accessToken);

  const revokeModeratorMutation =
    useRevokeModerator(accessToken);

  const deactivateMutation =
    useDeactivateUser(accessToken);

  const activateMutation =
    useActivateUser(accessToken);

  const deleteMutation =
    useDeleteAdminUser(accessToken);

  const targetUser = detailQuery.data;

  const anyMutationPending =
    promoteUserMutation.isPending ||
    promoteModeratorMutation.isPending ||
    demoteAdminMutation.isPending ||
    revokeModeratorMutation.isPending ||
    deactivateMutation.isPending ||
    activateMutation.isPending ||
    deleteMutation.isPending;

  const mutationError =
    promoteUserMutation.error ||
    promoteModeratorMutation.error ||
    demoteAdminMutation.error ||
    revokeModeratorMutation.error ||
    deactivateMutation.error ||
    activateMutation.error ||
    deleteMutation.error;

  function clearActionState() {
    setSuccessMessage(null);
    setValidationError(null);
  }

  function handlePromoteUser() {
    if (!userId || !targetUser) {
      return;
    }

    clearActionState();
    setConfirmationAction("promote-user");
  }

  function handlePromoteModerator() {
    if (!userId || !targetUser) {
      return;
    }

    clearActionState();
    setConfirmationAction("promote-moderator");
  }

  function handleDemoteAdmin() {
    if (!userId || !targetUser) {
      return;
    }

    clearActionState();
    setConfirmationAction("demote-admin");
  }

  function handleRevokeModerator() {
    if (!userId || !targetUser) {
      return;
    }

    clearActionState();
    setConfirmationAction("revoke-moderator");
  }

  function handleDeactivate() {
    if (!userId || !targetUser) {
      return;
    }

    clearActionState();

    const parsedDuration = Number(durationHours);
    const trimmedReason = reason.trim();

    if (
      !Number.isInteger(parsedDuration) ||
      parsedDuration < 1 ||
      parsedDuration > 2160
    ) {
      setValidationError(
        "Choose a deactivation duration between 1 and 2160 hours.",
      );
      return;
    }

    if (trimmedReason.length > 500) {
      setValidationError(
        "The deactivation reason cannot exceed 500 characters.",
      );
      return;
    }

    setDeactivationPreviewAt(
      new Date(
        Date.now() + parsedDuration * 60 * 60 * 1000,
      ).toISOString(),
    );
    setConfirmationAction("deactivate");
  }

  function handleActivate() {
    if (!userId || !targetUser) {
      return;
    }

    clearActionState();
    setConfirmationAction("activate");
  }

  function handleDelete() {
    if (!userId || !targetUser) {
      return;
    }

    if (currentUser?.id === targetUser.id) {
      return;
    }

    clearActionState();
    setConfirmationAction("delete-user");
  }

  async function confirmAction() {
    if (!userId || !targetUser || !confirmationAction) {
      return;
    }

    const action = confirmationAction;

    try {
      if (action === "promote-user") {
        await promoteUserMutation.mutateAsync({ userId });
        setSuccessMessage(
          `${targetUser.username} is now a moderator.`,
        );
      } else if (action === "promote-moderator") {
        await promoteModeratorMutation.mutateAsync({ userId });
        setSuccessMessage(
          `${targetUser.username} is now an administrator.`,
        );
      } else if (action === "demote-admin") {
        await demoteAdminMutation.mutateAsync({ userId });
        setSuccessMessage(
          `${targetUser.username} is now a moderator.`,
        );
      } else if (action === "revoke-moderator") {
        await revokeModeratorMutation.mutateAsync({ userId });
        setSuccessMessage(
          `${targetUser.username} is now a regular user.`,
        );
      } else if (action === "deactivate") {
        const parsedDuration = Number(durationHours);

        await deactivateMutation.mutateAsync({
          userId,
          payload: {
            duration_hours: parsedDuration,
            reason: reason.trim() || null,
          },
        });

        setSuccessMessage(
          `${targetUser.username}'s account has been deactivated.`,
        );
        setReason("");
      } else if (action === "activate") {
        await activateMutation.mutateAsync({ userId });
        setSuccessMessage(
          `${targetUser.username}'s account has been reactivated.`,
        );
      } else if (action === "delete-user") {
        await deleteMutation.mutateAsync({ userId });

        setDeactivationPreviewAt(null);
        setConfirmationAction(null);

        navigate("/admin/users", {
          replace: true,
          state: {
            successMessage: `${targetUser.username}'s account was permanently deleted.`,
          },
        });

        return;
      }

      setDeactivationPreviewAt(null);
      setConfirmationAction(null);
      void detailQuery.refetch();
    } catch {
      // Keep the confirmation dialog open so the mutation error
      // remains visible and the administrator can retry or cancel.
    }
  }

  function cancelConfirmation() {
    if (anyMutationPending) {
      return;
    }

    setDeactivationPreviewAt(null);
    setConfirmationAction(null);
  }

  const confirmationDetails =
    confirmationAction === "promote-user"
      ? {
          title: "Promote to moderator?",
          description: `This will give ${targetUser?.username ?? "this user"} moderation permissions. Continue?`,
          confirmLabel: "Promote to moderator",
          variant: "primary" as const,
        }
      : confirmationAction === "promote-moderator"
        ? {
            title: "Promote to administrator?",
            description: `This will give ${targetUser?.username ?? "this user"} full administrator permissions, including account and role management.`,
            confirmLabel: "Promote to administrator",
            variant: "primary" as const,
          }
        : confirmationAction === "demote-admin"
          ? {
              title: "Demote administrator?",
              description: `This will change ${targetUser?.username ?? "this user"} from administrator to moderator. The backend will prevent this if it violates administrator protection rules.`,
              confirmLabel: "Demote to moderator",
              variant: "danger" as const,
            }
          : confirmationAction === "revoke-moderator"
            ? {
                title: "Revoke moderator role?",
                description: `This will return ${targetUser?.username ?? "this user"} to the standard user role and remove their moderation permissions.`,
                confirmLabel: "Revoke moderator",
                variant: "danger" as const,
              }
            : confirmationAction === "deactivate"
              ? {
                  title: "Deactivate account?",
                  description: `This will temporarily block ${targetUser?.username ?? "this user's"} account access for ${durationHours} hour(s) while preserving their role. Scheduled reactivation: ${deactivationPreviewAt ? formatDate(deactivationPreviewAt) : "Not available"}.`,
                  confirmLabel: "Deactivate account",
                  variant: "danger" as const,
                }
              : confirmationAction === "activate"
                ? {
                    title: "Reactivate account?",
                    description: `This will restore ${targetUser?.username ?? "this user's"} account access.`,
                    confirmLabel: "Reactivate account",
                    variant: "primary" as const,
                  }
                : confirmationAction === "delete-user"
                  ? {
                      title: "Permanently delete account?",
                      description: `This will permanently delete ${targetUser?.username ?? "this user's"} TrackIt account and its associated data. This action cannot be undone.`,
                      confirmLabel: "Permanently delete account",
                      variant: "danger" as const,
                    }
                  : null;

  if (userId === null) {
    return (
      <section className="min-h-[calc(100vh-5rem)] bg-[var(--trackit-surface)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div
            className="rounded-2xl border border-red-200 bg-red-50 p-6"
            role="alert"
          >
            <h1 className="text-xl font-bold text-red-900">
              Invalid user
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-800">
              The requested user ID is not valid.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/users")}
              className="mt-5 !border-red-300 !text-red-800 hover:!border-red-400 hover:!text-red-900"
            >
              Back to users
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-5rem)] bg-[var(--trackit-surface)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div
            className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--trackit-blue)] border-r-transparent" />

            <p className="mt-4 font-semibold text-[var(--trackit-navy)]">
              Loading user details…
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (detailQuery.isError || !targetUser) {
    return (
      <section className="min-h-[calc(100vh-5rem)] bg-[var(--trackit-surface)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div
            className="rounded-2xl border border-red-200 bg-red-50 p-6"
            role="alert"
          >
            <h1 className="text-xl font-bold text-red-900">
              User details could not be loaded
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-800">
              {getApiErrorMessage(detailQuery.error)}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void detailQuery.refetch();
                }}
                className="!border-red-300 !text-red-800 hover:!border-red-400 hover:!text-red-900"
              >
                Try again
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/users")}
                className="!text-red-800 hover:!bg-red-100"
              >
                Back to users
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isSelf = currentUser?.id === targetUser.id;
  const role = targetUser.role;

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[var(--trackit-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/admin/users"
            className="text-sm font-semibold text-[var(--trackit-blue)] hover:underline"
          >
            ← Back to users
          </Link>
        </div>

        <header className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
                Administrator user detail
              </p>

              <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                {targetUser.username}
              </h1>

              <p className="mt-2 break-words text-base text-[var(--trackit-muted)]">
                {targetUser.first_name} {targetUser.last_name}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={[
                  "inline-flex rounded-full px-3 py-1.5",
                  "text-xs font-semibold",
                  roleClasses(targetUser.role),
                ].join(" ")}
              >
                {roleLabel(targetUser.role)}
              </span>

              <StatusBadge active={targetUser.is_active} />

              <VerificationBadge
                verified={targetUser.is_verified}
              />
            </div>
          </div>
        </header>

        {successMessage ? (
          <div
            className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-emerald-900">
              {successMessage}
            </p>
          </div>
        ) : null}

        <ActionError error={mutationError} />

        {validationError ? (
          <div
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"
            role="alert"
          >
            <p className="text-sm font-semibold text-amber-900">
              {validationError}
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--trackit-navy)]">
                Account information
              </h2>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <DetailField
                  label="Username"
                  value={targetUser.username}
                />

                <DetailField
                  label="Email"
                  value={targetUser.email}
                />

                <DetailField
                  label="First name"
                  value={targetUser.first_name}
                />

                <DetailField
                  label="Last name"
                  value={targetUser.last_name}
                />

                <DetailField
                  label="Phone"
                  value={targetUser.phone_number ?? ""}
                />

                <DetailField
                  label="Address"
                  value={targetUser.address ?? ""}
                />

                <DetailField
                  label="Created"
                  value={formatDate(targetUser.created_at)}
                />

                <DetailField
                  label="Last profile update"
                  value={formatDate(targetUser.updated_at)}
                />

                <DetailField
                  label="Password changed"
                  value={formatDate(
                    targetUser.password_changed_at,
                  )}
                />
              </dl>

              <div className="mt-6 border-t border-[var(--trackit-border)] pt-6">
                <DetailField
                  label="Bio"
                  value={targetUser.bio ?? ""}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--trackit-navy)]">
                Account access
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-muted)]">
                These controls change the user's TrackIt permissions.
                Backend authorization and business rules remain
                authoritative.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {role === "user" ? (
                  <div className="rounded-xl border border-[var(--trackit-border)] p-4">
                    <h3 className="font-semibold text-[var(--trackit-navy)]">
                      Promote to moderator
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[var(--trackit-muted)]">
                      Grants moderation permissions without granting
                      administrator role-management privileges.
                    </p>

                    <Button
                      variant="primary"
                      size="sm"
                      loading={
                        promoteUserMutation.isPending
                      }
                      disabled={isSelf || anyMutationPending}
                      onClick={handlePromoteUser}
                      className="mt-4"
                    >
                      Promote to moderator
                    </Button>

                    {isSelf ? (
                      <p className="mt-2 text-xs text-[var(--trackit-muted)]">
                        You cannot change your own role.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {role === "moderator" ? (
                  <>
                    <div className="rounded-xl border border-[var(--trackit-border)] p-4">
                      <h3 className="font-semibold text-[var(--trackit-navy)]">
                        Promote to administrator
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[var(--trackit-muted)]">
                        Grants full administrator permissions,
                        including account and role management.
                      </p>

                      <Button
                        variant="primary"
                        size="sm"
                        loading={
                          promoteModeratorMutation.isPending
                        }
                        disabled={isSelf || anyMutationPending}
                        onClick={handlePromoteModerator}
                        className="mt-4"
                      >
                        Promote to administrator
                      </Button>
                    </div>

                    <div className="rounded-xl border border-[var(--trackit-border)] p-4">
                      <h3 className="font-semibold text-[var(--trackit-navy)]">
                        Revoke moderator role
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-[var(--trackit-muted)]">
                        Returns the account to the standard user
                        role.
                      </p>

                      <Button
                        variant="danger"
                        size="sm"
                        loading={
                          revokeModeratorMutation.isPending
                        }
                        disabled={isSelf || anyMutationPending}
                        onClick={handleRevokeModerator}
                        className="mt-4"
                      >
                        Revoke moderator
                      </Button>
                    </div>
                  </>
                ) : null}

                {role === "admin" ? (
                  <div className="rounded-xl border border-[var(--trackit-border)] p-4 sm:col-span-2">
                    <h3 className="font-semibold text-[var(--trackit-navy)]">
                      Demote administrator
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[var(--trackit-muted)]">
                      Changes the account from administrator to
                      moderator. The backend prevents self-demotion
                      and protects the last active administrator.
                    </p>

                    <Button
                      variant="danger"
                      size="sm"
                      loading={
                        demoteAdminMutation.isPending
                      }
                      disabled={isSelf || anyMutationPending}
                      onClick={handleDemoteAdmin}
                      className="mt-4"
                    >
                      Demote to moderator
                    </Button>

                    {isSelf ? (
                      <p className="mt-2 text-xs text-[var(--trackit-muted)]">
                        You cannot demote your own administrator
                        account.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--trackit-navy)]">
                Profile and preferences
              </h2>

              <dl className="mt-6 grid gap-5 sm:grid-cols-2">
                <DetailField
                  label="Profile picture"
                  value={
                    targetUser.profile_picture
                      ? "Configured"
                      : "Not configured"
                  }
                />

                <SocialLinks
                  links={targetUser.social_links}
                />
              </dl>

              <div className="mt-6">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
                    Privacy preferences
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--trackit-muted)]">
                    Controls which profile information the user allows
                    other users to see.
                  </p>

                  <div className="mt-4">
                    <PrivacyPreferences
                      preferences={targetUser.preferences}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--trackit-navy)]">
                Account lifecycle
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-muted)]">
                Deactivation temporarily blocks account access while
                preserving the user's role.
              </p>

              {targetUser.is_active ? (
                <div className="mt-6">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[var(--trackit-navy)]">
                      Duration
                    </span>

                    <select
                      value={durationHours}
                      onChange={(event) =>
                        setDurationHours(event.target.value)
                      }
                      disabled={isSelf || anyMutationPending}
                      className={[
                        "min-h-11 w-full rounded-lg border px-3.5",
                        "border-[var(--trackit-border)]",
                        "bg-[var(--trackit-surface)]",
                        "text-[var(--trackit-text)]",
                        "focus:border-[var(--trackit-blue)]",
                        "focus:outline-none focus:ring-2",
                        "focus:ring-[var(--trackit-blue)]/20",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                      ].join(" ")}
                    >
                      <option value="1">1 hour</option>
                      <option value="6">6 hours</option>
                      <option value="12">12 hours</option>
                      <option value="24">24 hours</option>
                      <option value="48">48 hours</option>
                      <option value="72">72 hours</option>
                      <option value="168">7 days</option>
                      <option value="336">14 days</option>
                      <option value="720">30 days</option>
                      <option value="2160">90 days</option>
                    </select>
                  </label>

                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-semibold text-[var(--trackit-navy)]">
                      Reason
                    </span>

                    <textarea
                      value={reason}
                      onChange={(event) =>
                        setReason(event.target.value)
                      }
                      maxLength={500}
                      rows={5}
                      disabled={isSelf || anyMutationPending}
                      placeholder="Optional reason for deactivation"
                      className={[
                        "w-full resize-y rounded-lg border px-3.5 py-3",
                        "border-[var(--trackit-border)]",
                        "bg-[var(--trackit-surface)]",
                        "text-[var(--trackit-text)]",
                        "placeholder:text-[var(--trackit-muted)]",
                        "focus:border-[var(--trackit-blue)]",
                        "focus:outline-none focus:ring-2",
                        "focus:ring-[var(--trackit-blue)]/20",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                      ].join(" ")}
                    />

                    <span className="mt-1 block text-right text-xs text-[var(--trackit-muted)]">
                      {reason.length}/500
                    </span>
                  </label>

                  <Button
                    variant="danger"
                    size="md"
                    fullWidth
                    loading={deactivateMutation.isPending}
                    disabled={isSelf || anyMutationPending}
                    onClick={handleDeactivate}
                    className="mt-4"
                  >
                    Deactivate account
                  </Button>

                  {isSelf ? (
                    <p className="mt-3 text-xs leading-5 text-[var(--trackit-muted)]">
                      You cannot deactivate your own account.
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-6">
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-900">
                      Account inactive
                    </p>

                    <dl className="mt-3 space-y-3">
                      <DetailField
                        label="Deactivated"
                        value={formatDate(
                          targetUser.deactivated_at,
                        )}
                      />

                      <DetailField
                        label="Scheduled reactivation"
                        value={formatDate(
                          targetUser.deactivated_until,
                        )}
                      />

                      <DetailField
                        label="Reason"
                        value={
                          targetUser.deactivation_reason ??
                          "No reason provided"
                        }
                      />
                    </dl>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    loading={activateMutation.isPending}
                    disabled={anyMutationPending}
                    onClick={handleActivate}
                    className="mt-4"
                  >
                    Reactivate account
                  </Button>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-950/10">
              <h2 className="text-lg font-bold text-red-900 dark:text-red-200">
                Permanent account deletion
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-800 dark:text-red-300">
                Permanently removes this account and its associated
                TrackIt data. This cannot be undone.
              </p>

              <Button
                variant="danger"
                size="md"
                fullWidth
                loading={deleteMutation.isPending}
                disabled={isSelf || anyMutationPending}
                onClick={handleDelete}
                className="mt-5"
              >
                Permanently delete account
              </Button>

              {isSelf ? (
                <p className="mt-3 text-xs leading-5 text-red-700 dark:text-red-300">
                  You cannot permanently delete your own administrator
                  account.
                </p>
              ) : null}
            </section>

            <section className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-6 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--trackit-navy)]">
                Access notes
              </h2>

              <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--trackit-muted)]">
                <li>
                  • Role changes invalidate the affected user's
                  existing authorization state through the backend.
                </li>
                <li>
                  • Account deactivation invalidates existing
                  sessions.
                </li>
                <li>
                  • The backend enforces administrator protection
                  rules even if the frontend controls are bypassed.
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      {confirmationDetails ? (
        <ConfirmDialog
          open={confirmationAction !== null}
          title={confirmationDetails.title}
          description={confirmationDetails.description}
          confirmLabel={confirmationDetails.confirmLabel}
          variant={confirmationDetails.variant}
          loading={anyMutationPending}
          errorMessage={
            mutationError
              ? getApiErrorMessage(mutationError)
              : null
          }
          onConfirm={confirmAction}
          onCancel={cancelConfirmation}
        />
      ) : null}
    </section>
  );
}
