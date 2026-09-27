import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import {
  useModerationItems,
  usePendingClaims,
  usePendingReports,
} from "../../hooks/useModeration";
import type { Claim } from "../../types/claim";
import type { Item } from "../../types/item";
import type { Report } from "../../types/report";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getItemTypeClasses(type: Item["type"]): string {
  if (type === "lost") {
    return "bg-[var(--trackit-danger-soft)] text-[var(--trackit-danger-text)]";
  }

  return "bg-[var(--trackit-success-soft)] text-[var(--trackit-success)]";
}

function getItemTypeLabel(type: Item["type"]): string {
  return type === "lost" ? "Lost" : "Found";
}

function getClaimStatusClasses(status: Claim["status"]): string {
  switch (status) {
    case "pending":
      return "bg-[var(--trackit-warning-soft)] text-[var(--trackit-warning)]";
    case "approved":
      return "bg-[var(--trackit-success-soft)] text-[var(--trackit-success)]";
    case "rejected":
      return "bg-[var(--trackit-danger-soft)] text-[var(--trackit-danger-text)]";
    default:
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue-dark)]";
  }
}

function getReportStatusClasses(status: Report["status"]): string {
  switch (status) {
    case "pending":
      return "bg-[var(--trackit-warning-soft)] text-[var(--trackit-warning)]";
    case "reviewed":
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue-dark)]";
    case "resolved":
      return "bg-[var(--trackit-success-soft)] text-[var(--trackit-success)]";
    default:
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue-dark)]";
  }
}

function QueueCard({
  label,
  value,
  description,
  href,
  icon,
  isLoading,
}: {
  label: string;
  value: number;
  description: string;
  href: string;
  icon: string;
  isLoading: boolean;
}) {
  return (
    <Link
      to={href}
      className="group rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--trackit-blue-soft)] text-xl text-[var(--trackit-blue)]">
          <span aria-hidden="true">{icon}</span>
        </div>

        <span
          aria-hidden="true"
          className="text-lg text-[var(--trackit-text-muted)] transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </div>

      <p className="mt-5 text-sm font-semibold text-[var(--trackit-text-muted)]">
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
    </Link>
  );
}

function QueueSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5">
      <div className="h-4 w-28 rounded bg-[var(--trackit-surface-muted)]" />
      <div className="mt-3 h-5 w-3/4 rounded bg-[var(--trackit-surface-muted)]" />
      <div className="mt-3 h-4 w-full rounded bg-[var(--trackit-surface-muted)]" />
      <div className="mt-2 h-4 w-2/3 rounded bg-[var(--trackit-surface-muted)]" />
    </div>
  );
}

function ErrorMessage({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20">
      <p className="text-sm font-semibold text-red-900 dark:text-red-200">
        We could not load this moderation queue.
      </p>
      <p className="mt-1 text-sm leading-6 text-red-800 dark:text-red-300">
        {getApiErrorMessage(error)}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

export function ModeratorOverviewPage() {
  const { accessToken, user } = useAuth();

  const pendingClaimsQuery = usePendingClaims(accessToken);

  const pendingReportsQuery = usePendingReports(accessToken);

  const pendingItemsQuery = useModerationItems(
    {
      status: "pending",
      page: 1,
      limit: 20,
    },
    accessToken,
  );

  const pendingClaims = pendingClaimsQuery.data ?? [];
  const pendingReports = pendingReportsQuery.data ?? [];
  const pendingItems = pendingItemsQuery.data ?? [];

  const displayName = user?.username || "Moderator";

  const claimsError = pendingClaimsQuery.error;
  const reportsError = pendingReportsQuery.error;
  const itemsError = pendingItemsQuery.error;

  const hasClaimsError = Boolean(claimsError);
  const hasReportsError = Boolean(reportsError);
  const hasItemsError = Boolean(itemsError);

  return (
    <div className="min-h-screen bg-[var(--trackit-background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
            Moderator workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
            Welcome back, {displayName}
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--trackit-text-muted)]">
            Review new items, claims, and community reports while keeping
            TrackIt useful, trustworthy, and safe for everyone.
          </p>
        </header>

        <section
          aria-labelledby="moderation-queues-heading"
          className="mt-8"
        >
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
              Work queues
            </p>

            <h2
              id="moderation-queues-heading"
              className="mt-2 text-2xl font-bold text-[var(--trackit-navy)]"
            >
              Needs your attention
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <QueueCard
              label="Pending items"
              value={pendingItems.length}
              description="Items waiting for moderation."
              href="/moderator/items"
              icon="◈"
              isLoading={pendingItemsQuery.isLoading}
            />

            <QueueCard
              label="Pending claims"
              value={pendingClaims.length}
              description="Claims waiting for review."
              href="/moderator/claims"
              icon="✓"
              isLoading={pendingClaimsQuery.isLoading}
            />

            <QueueCard
              label="Pending reports"
              value={pendingReports.length}
              description="Community reports waiting for review."
              href="/moderator/reports"
              icon="!"
              isLoading={pendingReportsQuery.isLoading}
            />
          </div>
        </section>

        <section
          aria-labelledby="recent-items-heading"
          className="mt-10"
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                Item queue
              </p>

              <h2
                id="recent-items-heading"
                className="mt-2 text-2xl font-bold text-[var(--trackit-navy)]"
              >
                Items awaiting moderation
              </h2>
            </div>

            <Link
              to="/moderator/items"
              className="inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold text-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              Open item queue →
            </Link>
          </div>

          {hasItemsError ? (
            <ErrorMessage
              error={itemsError}
              onRetry={() => {
                void pendingItemsQuery.refetch();
              }}
            />
          ) : pendingItemsQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <QueueSkeleton key={index} />
              ))}
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-10 text-center">
              <p className="text-lg font-bold text-[var(--trackit-navy)]">
                No items are waiting for moderation
              </p>
              <p className="mt-2 text-sm text-[var(--trackit-text-muted)]">
                New submitted items will appear here when they require review.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {pendingItems.slice(0, 6).map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getItemTypeClasses(
                        item.type,
                      )}`}
                    >
                      {getItemTypeLabel(item.type)}
                    </span>

                    <span className="rounded-full bg-[var(--trackit-warning-soft)] px-3 py-1 text-xs font-semibold text-[var(--trackit-warning)]">
                      Pending
                    </span>
                  </div>

                  <h3 className="mt-4 line-clamp-2 text-lg font-bold text-[var(--trackit-navy)]">
                    {item.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    {item.description}
                  </p>

                  <div className="mt-4 space-y-1 text-xs text-[var(--trackit-text-muted)]">
                    <p>{item.category}</p>
                    <p>{item.location}</p>
                    <p>Submitted {formatDate(item.created_at)}</p>
                  </div>

                  <Link
                    to={`/items/${item.id}`}
                    className="mt-5 inline-flex min-h-10 items-center rounded-xl border border-[var(--trackit-border)] px-4 py-2 text-sm font-semibold text-[var(--trackit-navy)] transition-colors hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    View item
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 grid gap-10 xl:grid-cols-2">
          <section aria-labelledby="pending-claims-heading">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                  Claim queue
                </p>

                <h2
                  id="pending-claims-heading"
                  className="mt-2 text-2xl font-bold text-[var(--trackit-navy)]"
                >
                  Pending claims
                </h2>
              </div>

              <Link
                to="/moderator/claims"
                className="text-sm font-semibold text-[var(--trackit-blue)] hover:underline"
              >
                View all →
              </Link>
            </div>

            {hasClaimsError ? (
              <ErrorMessage
                error={claimsError}
                onRetry={() => {
                  void pendingClaimsQuery.refetch();
                }}
              />
            ) : pendingClaimsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <QueueSkeleton key={index} />
                ))}
              </div>
            ) : pendingClaims.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-10 text-center">
                <p className="font-bold text-[var(--trackit-navy)]">
                  No pending claims
                </p>
                <p className="mt-2 text-sm text-[var(--trackit-text-muted)]">
                  Claims requiring review will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingClaims.slice(0, 5).map((claim) => (
                  <article
                    key={claim.id}
                    className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-text-muted)]">
                            Claim #{claim.id}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getClaimStatusClasses(
                              claim.status,
                            )}`}
                          >
                            Pending
                          </span>
                        </div>

                        <p className="mt-2 truncate font-bold text-[var(--trackit-navy)]">
                          {claim.item.title}
                        </p>

                        <p className="mt-1 text-sm text-[var(--trackit-text-muted)]">
                          @{claim.claimant.username} · User #{claim.claimant.id} · Item #{claim.item_id}
                        </p>
                      </div>

                      <Link
                        to="/moderator/claims"
                        className="shrink-0 text-sm font-semibold text-[var(--trackit-blue)] hover:underline"
                      >
                        Review →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="pending-reports-heading">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                  Report queue
                </p>

                <h2
                  id="pending-reports-heading"
                  className="mt-2 text-2xl font-bold text-[var(--trackit-navy)]"
                >
                  Pending reports
                </h2>
              </div>

              <Link
                to="/moderator/reports"
                className="text-sm font-semibold text-[var(--trackit-blue)] hover:underline"
              >
                View all →
              </Link>
            </div>

            {hasReportsError ? (
              <ErrorMessage
                error={reportsError}
                onRetry={() => {
                  void pendingReportsQuery.refetch();
                }}
              />
            ) : pendingReportsQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <QueueSkeleton key={index} />
                ))}
              </div>
            ) : pendingReports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-10 text-center">
                <p className="font-bold text-[var(--trackit-navy)]">
                  No pending reports
                </p>
                <p className="mt-2 text-sm text-[var(--trackit-text-muted)]">
                  Community reports requiring review will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingReports.slice(0, 5).map((report) => (
                  <article
                    key={report.id}
                    className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-text-muted)]">
                            Report #{report.id}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getReportStatusClasses(
                              report.status,
                            )}`}
                          >
                            Pending
                          </span>
                        </div>

                        <p className="mt-2 truncate font-bold text-[var(--trackit-navy)]">
                          {report.reason}
                        </p>

                        <p className="mt-1 text-sm text-[var(--trackit-text-muted)]">
                          @{report.reporter.username} · User #{report.reporter.id} · Item #{report.item_id}
                        </p>
                      </div>

                      <Link
                        to="/moderator/reports"
                        className="shrink-0 text-sm font-semibold text-[var(--trackit-blue)] hover:underline"
                      >
                        Review →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
