import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import type {
  AdminAuditLog,
  AdminAuditLogFilters,
} from "../../types/audit";

const PAGE_SIZE = 20;

type SuccessFilter = "" | "true" | "false";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getActionLabel(action: string): string {
  return action
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getResourceLabel(log: AdminAuditLog): string {
  if (!log.resource_type) {
    return "—";
  }

  if (log.resource_id === null) {
    return log.resource_type;
  }

  return `${log.resource_type} #${log.resource_id}`;
}

function getRangeStart(page: number, total: number): number {
  if (total === 0) {
    return 0;
  }

  return (page - 1) * PAGE_SIZE + 1;
}

function getRangeEnd(page: number, total: number): number {
  return Math.min(page * PAGE_SIZE, total);
}

function buildFilters(
  actionInput: string,
  successFilter: SuccessFilter,
  userIdInput: string,
  resourceTypeInput: string,
  resourceIdInput: string,
  page: number,
): AdminAuditLogFilters {
  const filters: AdminAuditLogFilters = {
    page,
    limit: PAGE_SIZE,
  };

  const action = actionInput.trim();
  if (action) {
    filters.action = action;
  }

  if (successFilter !== "") {
    filters.success = successFilter === "true";
  }

  const userId = Number.parseInt(userIdInput, 10);
  if (
    userIdInput.trim() &&
    Number.isInteger(userId) &&
    userId > 0
  ) {
    filters.user_id = userId;
  }

  const resourceType = resourceTypeInput.trim();
  if (resourceType) {
    filters.resource_type = resourceType;
  }

  const resourceId = Number.parseInt(resourceIdInput, 10);
  if (
    resourceIdInput.trim() &&
    Number.isInteger(resourceId) &&
    resourceId > 0
  ) {
    filters.resource_id = resourceId;
  }

  return filters;
}

function AuditLogCard({ log }: { log: AdminAuditLog }) {
  return (
    <article className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-[var(--trackit-light)] px-3 py-1 text-xs font-semibold text-[var(--trackit-navy)]">
              {getActionLabel(log.action)}
            </span>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                log.success
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {log.success ? "Successful" : "Failed"}
            </span>
          </div>

          <p className="mt-3 text-sm text-[var(--trackit-muted)]">
            {formatDate(log.created_at)}
          </p>
        </div>

        <div
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
            log.actor
              ? "bg-[var(--trackit-surface-muted)] text-[var(--trackit-text)]"
              : "bg-[var(--trackit-light)] text-[var(--trackit-navy)]"
          }`}
        >
          {log.actor
            ? `${log.actor.username} (#${log.actor.id})`
            : "System"}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
            Resource
          </p>
          <p className="mt-1 break-words text-sm text-[var(--trackit-text)]">
            {getResourceLabel(log)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
            Actor ID
          </p>
          <p className="mt-1 text-sm text-[var(--trackit-text)]">
            {log.user_id === null ? "System event" : `#${log.user_id}`}
          </p>
        </div>
      </div>

      {log.details ? (
        <div className="mt-5 rounded-xl bg-[var(--trackit-surface-muted)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
            Details
          </p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--trackit-text)]">
            {log.details}
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <p className="text-sm text-[var(--trackit-muted)]">
            No additional details recorded.
          </p>
        </div>
      )}
    </article>
  );
}

export default function AdminAuditLogsPage() {
  const { accessToken } = useAuth();

  const [actionInput, setActionInput] = useState("");
  const [successFilter, setSuccessFilter] =
    useState<SuccessFilter>("");
  const [userIdInput, setUserIdInput] = useState("");
  const [resourceTypeInput, setResourceTypeInput] = useState("");
  const [resourceIdInput, setResourceIdInput] = useState("");
  const [page, setPage] = useState(1);

  const [appliedFilters, setAppliedFilters] =
    useState<AdminAuditLogFilters>(() =>
      buildFilters("", "", "", "", "", 1),
    );

  const userIdError = useMemo(() => {
    const value = userIdInput.trim();

    if (!value) {
      return null;
    }

    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return "Actor ID must be a positive whole number.";
    }

    return null;
  }, [userIdInput]);

  const resourceIdError = useMemo(() => {
    const value = resourceIdInput.trim();

    if (!value) {
      return null;
    }

    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return "Resource ID must be a positive whole number.";
    }

    return null;
  }, [resourceIdInput]);

  const auditLogsQuery = useAuditLogs(
    appliedFilters,
    accessToken,
  );

  const response = auditLogsQuery.data;
  const logs = response?.items ?? [];
  const total = response?.total ?? 0;
  const currentPage = response?.page ?? page;
  const totalPages = response?.pages ?? 0;

  function applyFilters() {
    if (userIdError || resourceIdError) {
      return;
    }

    const nextPage = 1;

    setPage(nextPage);
    setAppliedFilters(
      buildFilters(
        actionInput,
        successFilter,
        userIdInput,
        resourceTypeInput,
        resourceIdInput,
        nextPage,
      ),
    );
  }

  function resetFilters() {
    setActionInput("");
    setSuccessFilter("");
    setUserIdInput("");
    setResourceTypeInput("");
    setResourceIdInput("");
    setPage(1);
    setAppliedFilters(
      buildFilters("", "", "", "", "", 1),
    );
  }

  function changePage(nextPage: number) {
    if (
      nextPage < 1 ||
      (totalPages > 0 && nextPage > totalPages) ||
      auditLogsQuery.isFetching
    ) {
      return;
    }

    setPage(nextPage);
    setAppliedFilters(
      buildFilters(
        actionInput,
        successFilter,
        userIdInput,
        resourceTypeInput,
        resourceIdInput,
        nextPage,
      ),
    );
  }

  const hasFilters =
    Boolean(actionInput.trim()) ||
    successFilter !== "" ||
    Boolean(userIdInput.trim()) ||
    Boolean(resourceTypeInput.trim()) ||
    Boolean(resourceIdInput.trim());

  const rangeStart = getRangeStart(currentPage, total);
  const rangeEnd = getRangeEnd(currentPage, total);

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[var(--trackit-surface-muted)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/admin"
            className="text-sm font-semibold text-[var(--trackit-primary)] hover:underline"
          >
            ← Back to admin overview
          </Link>

          <div className="mt-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--trackit-primary)]">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
              Audit Logs
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--trackit-muted)] sm:text-base">
              Review recorded administrative and security events,
              including successful and failed actions.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--trackit-text)]">
                Filters
              </h2>
              <p className="mt-1 text-sm text-[var(--trackit-muted)]">
                Narrow the audit history by action, actor, or resource.
              </p>
            </div>

            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-[var(--trackit-primary)] hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <label className="block">
              <span className="text-sm font-semibold text-[var(--trackit-text)]">
                Action
              </span>
              <input
                type="text"
                value={actionInput}
                onChange={(event) =>
                  setActionInput(event.target.value)
                }
                maxLength={100}
                placeholder="e.g. admin_action"
                className="mt-2 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-primary)] focus:ring-2 focus:ring-[var(--trackit-primary)]/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--trackit-text)]">
                Result
              </span>
              <select
                value={successFilter}
                onChange={(event) =>
                  setSuccessFilter(
                    event.target.value as SuccessFilter,
                  )
                }
                className="mt-2 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-primary)] focus:ring-2 focus:ring-[var(--trackit-primary)]/20"
              >
                <option value="">All results</option>
                <option value="true">Successful</option>
                <option value="false">Failed</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--trackit-text)]">
                Actor ID
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={userIdInput}
                onChange={(event) =>
                  setUserIdInput(event.target.value)
                }
                placeholder="User ID"
                aria-invalid={Boolean(userIdError)}
                className={`mt-2 w-full rounded-xl border bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:ring-2 ${
                  userIdError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-[var(--trackit-border)] focus:border-[var(--trackit-primary)] focus:ring-[var(--trackit-primary)]/20"
                }`}
              />
              {userIdError ? (
                <p className="mt-1 text-xs text-red-700">
                  {userIdError}
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--trackit-text)]">
                Resource type
              </span>
              <input
                type="text"
                value={resourceTypeInput}
                onChange={(event) =>
                  setResourceTypeInput(event.target.value)
                }
                maxLength={100}
                placeholder="e.g. user"
                className="mt-2 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-primary)] focus:ring-2 focus:ring-[var(--trackit-primary)]/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--trackit-text)]">
                Resource ID
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={resourceIdInput}
                onChange={(event) =>
                  setResourceIdInput(event.target.value)
                }
                placeholder="Resource ID"
                aria-invalid={Boolean(resourceIdError)}
                className={`mt-2 w-full rounded-xl border bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:ring-2 ${
                  resourceIdError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-[var(--trackit-border)] focus:border-[var(--trackit-primary)] focus:ring-[var(--trackit-primary)]/20"
                }`}
              />
              {resourceIdError ? (
                <p className="mt-1 text-xs text-red-700">
                  {resourceIdError}
                </p>
              ) : null}
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={applyFilters}
              disabled={Boolean(userIdError || resourceIdError)}
              className="rounded-xl bg-[var(--trackit-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--trackit-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Apply filters
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--trackit-text)]">
              Audit history
            </h2>
            {!auditLogsQuery.isLoading && total > 0 ? (
              <p className="mt-1 text-sm text-[var(--trackit-muted)]">
                Showing {rangeStart}–{rangeEnd} of {total} events
              </p>
            ) : null}
          </div>

          {auditLogsQuery.isFetching &&
          !auditLogsQuery.isLoading ? (
            <p className="text-sm text-[var(--trackit-muted)]">
              Updating…
            </p>
          ) : null}
        </div>

        {auditLogsQuery.isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-52 animate-pulse rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)]"
              />
            ))}
          </div>
        ) : auditLogsQuery.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h3 className="font-semibold text-red-900">
              Could not load audit logs
            </h3>
            <p className="mt-2 text-sm leading-6 text-red-800">
              {getApiErrorMessage(auditLogsQuery.error)}
            </p>
            <button
              type="button"
              onClick={() => auditLogsQuery.refetch()}
              className="mt-4 rounded-xl bg-[var(--trackit-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--trackit-primary-hover)]"
            >
              Try again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-12 text-center shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--trackit-text)]">
              No audit events found
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--trackit-muted)]">
              {hasFilters
                ? "No events match the current filters. Try clearing one or more filters."
                : "There are no audit events to display yet."}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-[var(--trackit-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--trackit-primary-hover)]"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid gap-4">
              {logs.map((log) => (
                <AuditLogCard key={log.id} log={log} />
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--trackit-muted)]">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => changePage(currentPage - 1)}
                    disabled={
                      currentPage <= 1 ||
                      auditLogsQuery.isFetching
                    }
                    className="rounded-xl border border-[var(--trackit-border)] px-4 py-2 text-sm font-semibold text-[var(--trackit-text)] transition hover:bg-[var(--trackit-surface-muted)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() => changePage(currentPage + 1)}
                    disabled={
                      currentPage >= totalPages ||
                      auditLogsQuery.isFetching
                    }
                    className="rounded-xl bg-[var(--trackit-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--trackit-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
