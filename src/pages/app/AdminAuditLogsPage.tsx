import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  exportAdminAuditLogs,
  previewAdminAuditLogs,
} from "../../api/audit";
import { getApiErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import type {
  AdminAuditLog,
  AdminAuditLogFilters,
} from "../../types/audit";

const PAGE_SIZE = 20;

type SuccessFilter = "" | "true" | "false";
type ExportFormat = "csv" | "json";

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

function parsePositiveIds(value: string): number[] | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return [];
  }

  const parts = trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }

  const ids = parts.map((part) => Number(part));

  if (
    ids.some(
      (id) => !Number.isSafeInteger(id) || id <= 0,
    )
  ) {
    return null;
  }

  return [...new Set(ids)];
}

function toIsoDateTime(value: string): string | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function buildFilters(
  actionInput: string,
  categoryInput: string,
  successFilter: SuccessFilter,
  userIdInput: string,
  subjectUserIdInput: string,
  resourceTypeInput: string,
  resourceIdInput: string,
  actorIdsInput: string,
  createdFromInput: string,
  createdToInput: string,
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

  const category = categoryInput.trim();
  if (category) {
    filters.category = category;
  }

  if (successFilter !== "") {
    filters.success = successFilter === "true";
  }

  const userId = Number.parseInt(userIdInput, 10);
  const actorIds = parsePositiveIds(actorIdsInput);

  if (userIdInput.trim()) {
    filters.user_id = userId;
  } else if (actorIds?.length === 1) {
    filters.user_id = actorIds[0];
  } else if (actorIds && actorIds.length > 1) {
    filters.user_ids = actorIds;
  }

  const subjectUserId = Number.parseInt(
    subjectUserIdInput,
    10,
  );
  if (
    subjectUserIdInput.trim() &&
    Number.isInteger(subjectUserId) &&
    subjectUserId > 0
  ) {
    filters.subject_user_id = subjectUserId;
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

  const createdFrom = toIsoDateTime(createdFromInput);
  if (createdFrom) {
    filters.created_from = createdFrom;
  }

  const createdTo = toIsoDateTime(createdToInput);
  if (createdTo) {
    filters.created_to = createdTo;
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

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            {log.user_id === null
              ? "System event"
              : `#${log.user_id}`}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
            Affected User ID
          </p>
          <p className="mt-1 text-sm text-[var(--trackit-text)]">
            {log.subject_user_id === null
              ? "—"
              : `#${log.subject_user_id}`}
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
  const [categoryInput, setCategoryInput] = useState("");
  const [successFilter, setSuccessFilter] =
    useState<SuccessFilter>("");
  const [userIdInput, setUserIdInput] = useState("");
  const [actorIdsInput, setActorIdsInput] = useState("");
  const [subjectUserIdInput, setSubjectUserIdInput] =
    useState("");
  const [resourceTypeInput, setResourceTypeInput] =
    useState("");
  const [resourceIdInput, setResourceIdInput] = useState("");
  const [createdFromInput, setCreatedFromInput] =
    useState("");
  const [createdToInput, setCreatedToInput] =
    useState("");
  const [page, setPage] = useState(1);

  const [previewResult, setPreviewResult] =
    useState<number | null>(null);
  const [previewLoading, setPreviewLoading] =
    useState(false);
  const [previewError, setPreviewError] =
    useState<string | null>(null);
  const [exportingFormat, setExportingFormat] =
    useState<ExportFormat | null>(null);

  const [appliedFilters, setAppliedFilters] =
    useState<AdminAuditLogFilters>(() =>
      buildFilters("", "", "", "", "", "", "", "", "", "", 1),
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

  const subjectUserIdError = useMemo(() => {
    const value = subjectUserIdInput.trim();

    if (!value) {
      return null;
    }

    const parsed = Number.parseInt(value, 10);

    if (!Number.isInteger(parsed) || parsed <= 0) {
      return "Affected user ID must be a positive whole number.";
    }

    return null;
  }, [subjectUserIdInput]);

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

  const actorIdsError = useMemo(() => {
    if (!actorIdsInput.trim()) {
      return null;
    }

    return parsePositiveIds(actorIdsInput) === null
      ? "Actor IDs must be positive whole numbers separated by commas."
      : null;
  }, [actorIdsInput]);

  const dateRangeError = useMemo(() => {
    if (!createdFromInput || !createdToInput) {
      return null;
    }

    const from = new Date(createdFromInput);
    const to = new Date(createdToInput);

    if (
      Number.isNaN(from.getTime()) ||
      Number.isNaN(to.getTime())
    ) {
      return "Enter valid date and time values.";
    }

    if (from >= to) {
      return "Start date/time must be before end date/time.";
    }

    return null;
  }, [createdFromInput, createdToInput]);

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
    if (
      userIdError ||
      subjectUserIdError ||
      resourceIdError ||
      actorIdsError ||
      dateRangeError
    ) {
      return;
    }

    const nextPage = 1;

    setPage(nextPage);
    setAppliedFilters(
      buildFilters(
        actionInput,
        categoryInput,
        successFilter,
        userIdInput,
        subjectUserIdInput,
        resourceTypeInput,
        resourceIdInput,
        actorIdsInput,
        createdFromInput,
        createdToInput,
        nextPage,
      ),
    );
  }

  function resetFilters() {
    setActionInput("");
    setCategoryInput("");
    setSuccessFilter("");
    setUserIdInput("");
    setActorIdsInput("");
    setSubjectUserIdInput("");
    setResourceTypeInput("");
    setResourceIdInput("");
    setCreatedFromInput("");
    setCreatedToInput("");
    setPreviewResult(null);
    setPreviewError(null);
    setPage(1);
    setAppliedFilters(
      buildFilters(
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        1,
      ),
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
        categoryInput,
        successFilter,
        userIdInput,
        subjectUserIdInput,
        resourceTypeInput,
        resourceIdInput,
        actorIdsInput,
        createdFromInput,
        createdToInput,
        nextPage,
      ),
    );
  }

  async function handlePreview() {
    if (!accessToken) {
      return;
    }

    if (
      userIdError ||
      subjectUserIdError ||
      resourceIdError ||
      actorIdsError ||
      dateRangeError
    ) {
      return;
    }

    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const filters = buildFilters(
        actionInput,
        categoryInput,
        successFilter,
        userIdInput,
        subjectUserIdInput,
        resourceTypeInput,
        resourceIdInput,
        actorIdsInput,
        createdFromInput,
        createdToInput,
        1,
      );

      delete filters.page;
      delete filters.limit;

      const result = await previewAdminAuditLogs(
        filters,
        accessToken,
      );

      setPreviewResult(result.total);
    } catch (error) {
      setPreviewResult(null);
      setPreviewError(getApiErrorMessage(error));
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleExport(format: ExportFormat) {
    if (!accessToken) {
      return;
    }

    if (
      userIdError ||
      subjectUserIdError ||
      resourceIdError ||
      actorIdsError ||
      dateRangeError
    ) {
      return;
    }

    setExportingFormat(format);

    try {
      const filters = buildFilters(
        actionInput,
        categoryInput,
        successFilter,
        userIdInput,
        subjectUserIdInput,
        resourceTypeInput,
        resourceIdInput,
        actorIdsInput,
        createdFromInput,
        createdToInput,
        1,
      );

      delete filters.page;
      delete filters.limit;

      await exportAdminAuditLogs(
        filters,
        format,
        accessToken,
      );
    } catch (error) {
      setPreviewError(getApiErrorMessage(error));
    } finally {
      setExportingFormat(null);
    }
  }

  const hasFilters =
    Boolean(actionInput.trim()) ||
    Boolean(categoryInput.trim()) ||
    successFilter !== "" ||
    Boolean(userIdInput.trim()) ||
    Boolean(actorIdsInput.trim()) ||
    Boolean(subjectUserIdInput.trim()) ||
    Boolean(resourceTypeInput.trim()) ||
    Boolean(resourceIdInput.trim()) ||
    Boolean(createdFromInput) ||
    Boolean(createdToInput);

  const rangeStart = getRangeStart(currentPage, total);
  const rangeEnd = getRangeEnd(currentPage, total);

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[var(--trackit-surface-muted)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/admin"
            className="text-sm font-semibold text-[var(--trackit-blue)] hover:underline"
          >
            ← Back to admin overview
          </Link>

          <div className="mt-4">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
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
                Narrow the audit history by action, actor, affected user, or resource.
              </p>
            </div>

            {hasFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-semibold text-[var(--trackit-blue)] hover:underline"
              >
                Clear filters
              </button>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                className="mt-2 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--trackit-text)]">
                Category
              </span>
              <input
                type="text"
                value={categoryInput}
                onChange={(event) =>
                  setCategoryInput(event.target.value)
                }
                maxLength={100}
                placeholder="e.g. security"
                className="mt-2 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
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
                className="mt-2 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
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
                    : "border-[var(--trackit-border)] focus:border-[var(--trackit-blue)] focus:ring-[var(--trackit-blue)]/20"
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
                Multiple Actor IDs
              </span>
              <input
                type="text"
                value={actorIdsInput}
                onChange={(event) =>
                  setActorIdsInput(event.target.value)
                }
                placeholder="e.g. 12, 18, 24"
                aria-invalid={Boolean(actorIdsError)}
                className={`mt-2 w-full rounded-xl border bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:ring-2 ${
                  actorIdsError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-[var(--trackit-border)] focus:border-[var(--trackit-blue)] focus:ring-[var(--trackit-blue)]/20"
                }`}
              />
              {actorIdsError ? (
                <p className="mt-1 text-xs text-red-700">
                  {actorIdsError}
                </p>
              ) : (
                <p className="mt-1 text-xs text-[var(--trackit-muted)]">
                  Leave empty to include all actors.
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--trackit-text)]">
                Affected User ID
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={subjectUserIdInput}
                onChange={(event) =>
                  setSubjectUserIdInput(event.target.value)
                }
                placeholder="User ID"
                aria-invalid={Boolean(subjectUserIdError)}
                className={`mt-2 w-full rounded-xl border bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:ring-2 ${
                  subjectUserIdError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-[var(--trackit-border)] focus:border-[var(--trackit-blue)] focus:ring-[var(--trackit-blue)]/20"
                }`}
              />
              {subjectUserIdError ? (
                <p className="mt-1 text-xs text-red-700">
                  {subjectUserIdError}
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
                className="mt-2 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
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
                    : "border-[var(--trackit-border)] focus:border-[var(--trackit-blue)] focus:ring-[var(--trackit-blue)]/20"
                }`}
              />
              {resourceIdError ? (
                <p className="mt-1 text-xs text-red-700">
                  {resourceIdError}
                </p>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--trackit-text)]">
                From
              </span>
              <input
                type="datetime-local"
                value={createdFromInput}
                onChange={(event) =>
                  setCreatedFromInput(event.target.value)
                }
                aria-invalid={Boolean(dateRangeError)}
                className={`mt-2 w-full rounded-xl border bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:ring-2 ${
                  dateRangeError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-[var(--trackit-border)] focus:border-[var(--trackit-blue)] focus:ring-[var(--trackit-blue)]/20"
                }`}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[var(--trackit-text)]">
                To
              </span>
              <input
                type="datetime-local"
                value={createdToInput}
                onChange={(event) =>
                  setCreatedToInput(event.target.value)
                }
                aria-invalid={Boolean(dateRangeError)}
                className={`mt-2 w-full rounded-xl border bg-[var(--trackit-surface)] px-3 py-2.5 text-sm text-[var(--trackit-text)] outline-none transition focus:ring-2 ${
                  dateRangeError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-[var(--trackit-border)] focus:border-[var(--trackit-blue)] focus:ring-[var(--trackit-blue)]/20"
                }`}
              />
            </label>
          </div>

          {dateRangeError ? (
            <p className="mt-2 text-xs text-red-700">
              {dateRangeError}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={handlePreview}
              disabled={Boolean(
                userIdError ||
                  subjectUserIdError ||
                  resourceIdError ||
                  actorIdsError ||
                  dateRangeError ||
                  previewLoading,
              )}
              className="rounded-xl border border-[var(--trackit-border)] px-5 py-2.5 text-sm font-semibold text-[var(--trackit-text)] transition hover:bg-[var(--trackit-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {previewLoading
                ? "Checking…"
                : "Preview results"}
            </button>

            <button
              type="button"
              onClick={applyFilters}
              disabled={Boolean(
                userIdError ||
                  subjectUserIdError ||
                  resourceIdError ||
                  actorIdsError ||
                  dateRangeError,
              )}
              className="rounded-xl bg-[var(--trackit-blue)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--trackit-blue-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Apply filters
            </button>
          </div>

          {previewResult !== null || previewError ? (
            <div className="mt-5 rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-muted)] p-4">
              {previewError ? (
                <p className="text-sm text-red-700">
                  Preview/export error: {previewError}
                </p>
              ) : (
                <p className="text-sm text-[var(--trackit-text)]">
                  Preview:{" "}
                  <span className="font-semibold">
                    {previewResult} matching event
                    {previewResult === 1 ? "" : "s"}
                  </span>
                </p>
              )}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => handleExport("csv")}
              disabled={Boolean(
                userIdError ||
                  subjectUserIdError ||
                  resourceIdError ||
                  actorIdsError ||
                  dateRangeError ||
                  exportingFormat,
              )}
              className="rounded-xl border border-[var(--trackit-border)] px-4 py-2.5 text-sm font-semibold text-[var(--trackit-text)] transition hover:bg-[var(--trackit-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportingFormat === "csv"
                ? "Exporting CSV…"
                : "Export CSV"}
            </button>

            <button
              type="button"
              onClick={() => handleExport("json")}
              disabled={Boolean(
                userIdError ||
                  subjectUserIdError ||
                  resourceIdError ||
                  actorIdsError ||
                  dateRangeError ||
                  exportingFormat,
              )}
              className="rounded-xl border border-[var(--trackit-border)] px-4 py-2.5 text-sm font-semibold text-[var(--trackit-text)] transition hover:bg-[var(--trackit-surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportingFormat === "json"
                ? "Exporting JSON…"
                : "Export JSON"}
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
              className="mt-4 rounded-xl bg-[var(--trackit-blue)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--trackit-blue-hover)]"
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
                className="mt-5 rounded-xl bg-[var(--trackit-blue)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--trackit-blue-hover)]"
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
                    className="rounded-xl bg-[var(--trackit-blue)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--trackit-blue-hover)] disabled:cursor-not-allowed disabled:opacity-50"
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
