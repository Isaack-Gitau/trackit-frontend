import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import {
  useAdminUsers,
} from "../../hooks/useAdmin";
import {
  usePendingClaims,
  usePendingReports,
} from "../../hooks/useModeration";

function StatCard({
  label,
  value,
  description,
  href,
  isLoading,
}: {
  label: string;
  value: number;
  description: string;
  href: string;
  isLoading: boolean;
}) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--trackit-text-muted)]">
            {label}
          </p>

          {isLoading ? (
            <div className="mt-2 h-9 w-16 animate-pulse rounded-lg bg-[var(--trackit-surface-muted)]" />
          ) : (
            <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--trackit-navy)]">
              {value}
            </p>
          )}

          <p className="mt-1 text-sm leading-5 text-[var(--trackit-text-muted)]">
            {description}
          </p>
        </div>

        <span
          aria-hidden="true"
          className="text-lg text-[var(--trackit-text-muted)] transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </Link>
  );
}

function ErrorPanel({
  title,
  error,
  onRetry,
}: {
  title: string;
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
      <p className="text-sm font-semibold text-red-900 dark:text-red-200">
        {title}
      </p>

      <p className="mt-1 text-sm leading-6 text-red-800 dark:text-red-300">
        {getApiErrorMessage(error)}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
      >
        Try again
      </button>
    </div>
  );
}

export function AdminOverviewPage() {
  const { accessToken, user } = useAuth();

  const usersQuery = useAdminUsers(
    {
      page: 1,
      limit: 1,
    },
    accessToken,
  );

  const activeUsersQuery = useAdminUsers(
    {
      status: "active",
      page: 1,
      limit: 1,
    },
    accessToken,
  );

  const inactiveUsersQuery = useAdminUsers(
    {
      status: "inactive",
      page: 1,
      limit: 1,
    },
    accessToken,
  );

  const pendingClaimsQuery =
    usePendingClaims(accessToken);

  const pendingReportsQuery =
    usePendingReports(accessToken);

  const displayName = user?.username || "Administrator";

  const usersError = usersQuery.error;
  const activeUsersError = activeUsersQuery.error;
  const inactiveUsersError = inactiveUsersQuery.error;
  const claimsError = pendingClaimsQuery.error;
  const reportsError = pendingReportsQuery.error;

  const hasUserStatsError =
    Boolean(usersError) ||
    Boolean(activeUsersError) ||
    Boolean(inactiveUsersError);

  const hasModerationError =
    Boolean(claimsError) ||
    Boolean(reportsError);

  const totalUsers = usersQuery.data?.total ?? 0;
  const activeUsers =
    activeUsersQuery.data?.total ?? 0;
  const inactiveUsers =
    inactiveUsersQuery.data?.total ?? 0;

  const pendingClaims =
    pendingClaimsQuery.data?.length ?? 0;

  const pendingReports =
    pendingReportsQuery.data?.length ?? 0;

  const retryUserStats = () => {
    void usersQuery.refetch();
    void activeUsersQuery.refetch();
    void inactiveUsersQuery.refetch();
  };

  const retryModeration = () => {
    void pendingClaimsQuery.refetch();
    void pendingReportsQuery.refetch();
  };

  return (
    <div className="min-h-screen bg-[var(--trackit-background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
            Administrator workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
            Welcome back, {displayName}
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--trackit-text-muted)]">
            Manage TrackIt users, account access, roles, moderation,
            and administrator communications from one place.
          </p>
        </header>

        <section
          aria-labelledby="user-overview-heading"
          className="mt-8"
        >
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
              User management
            </p>

            <h2
              id="user-overview-heading"
              className="mt-2 text-2xl font-bold text-[var(--trackit-navy)]"
            >
              Account overview
            </h2>
          </div>

          {hasUserStatsError ? (
            <ErrorPanel
              title="We could not load the user overview."
              error={
                usersError ||
                activeUsersError ||
                inactiveUsersError
              }
              onRetry={retryUserStats}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                label="Total users"
                value={totalUsers}
                description="Registered TrackIt accounts."
                href="/admin/users"
                isLoading={usersQuery.isLoading}
              />

              <StatCard
                label="Active users"
                value={activeUsers}
                description="Accounts currently active."
                href="/admin/users?status=active"
                isLoading={activeUsersQuery.isLoading}
              />

              <StatCard
                label="Inactive users"
                value={inactiveUsers}
                description="Accounts currently inactive."
                href="/admin/users?status=inactive"
                isLoading={inactiveUsersQuery.isLoading}
              />
            </div>
          )}
        </section>

        <section
          aria-labelledby="moderation-overview-heading"
          className="mt-10"
        >
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
              Moderation
            </p>

            <h2
              id="moderation-overview-heading"
              className="mt-2 text-2xl font-bold text-[var(--trackit-navy)]"
            >
              Work requiring attention
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--trackit-text-muted)]">
              Claims and reports show their current pending queues here.
              Item moderation is available from the dedicated moderation
              workspace.
            </p>
          </div>

          {hasModerationError ? (
            <ErrorPanel
              title="We could not load the moderation overview."
              error={claimsError || reportsError}
              onRetry={retryModeration}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <StatCard
                label="Pending claims"
                value={pendingClaims}
                description="Claims waiting for review."
                href="/admin/moderation"
                isLoading={pendingClaimsQuery.isLoading}
              />

              <StatCard
                label="Pending reports"
                value={pendingReports}
                description="Reports waiting for review."
                href="/admin/moderation"
                isLoading={pendingReportsQuery.isLoading}
              />
            </div>
          )}
        </section>

        <section
          aria-labelledby="admin-actions-heading"
          className="mt-10"
        >
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
              Administrator tools
            </p>

            <h2
              id="admin-actions-heading"
              className="mt-2 text-2xl font-bold text-[var(--trackit-navy)]"
            >
              Quick actions
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              to="/admin/users"
              className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              <h3 className="text-lg font-bold text-[var(--trackit-navy)]">
                Manage users
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Search accounts, inspect administrator-visible
                details, manage roles, and handle account lifecycle.
              </p>

              <span className="mt-4 inline-flex text-sm font-semibold text-[var(--trackit-blue)]">
                Open user management →
              </span>
            </Link>

            <Link
              to="/admin/email"
              className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              <h3 className="text-lg font-bold text-[var(--trackit-navy)]">
                Send administrator email
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Send a message to selected registered TrackIt users
                and review delivery results.
              </p>

              <span className="mt-4 inline-flex text-sm font-semibold text-[var(--trackit-blue)]">
                Open email tool →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}