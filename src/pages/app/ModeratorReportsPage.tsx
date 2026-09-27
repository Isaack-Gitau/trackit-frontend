import { useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../api/errors";
import {
  usePendingReports,
  useResolveReport,
  useReviewReport,
  useReviewedReports,
} from "../../hooks/useModeration";
import { useAuth } from "../../context/AuthContext";
import type { ModerationReport, Report } from "../../types/report";

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusClasses(status: Report["status"]): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
    case "reviewed":
      return "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300";
    case "resolved":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "withdrawn":
      return "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300";
  }
}

function getStatusLabel(status: Report["status"]): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "reviewed":
      return "Reviewed";
    case "resolved":
      return "Resolved";
    case "withdrawn":
      return "Withdrawn";
    default:
      return status;
  }
}

function ReportSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm">
      <div className="h-5 w-28 rounded bg-[var(--trackit-text-muted)]/20" />
      <div className="mt-4 h-6 w-2/3 rounded bg-[var(--trackit-text-muted)]/20" />
      <div className="mt-3 h-4 w-full rounded bg-[var(--trackit-text-muted)]/20" />
      <div className="mt-2 h-4 w-5/6 rounded bg-[var(--trackit-text-muted)]/20" />
      <div className="mt-5 h-10 w-full rounded bg-[var(--trackit-text-muted)]/20" />
    </div>
  );
}

function ReportCard({
  report,
  onReview,
  onResolve,
  isReviewing,
  isResolving,
  reviewError,
}: {
  report: ModerationReport;
  onReview: (reportId: number) => void;
  onResolve: (report: ModerationReport) => void;
  isReviewing: boolean;
  isResolving: boolean;
  reviewError: string | null;
}) {
  const canReview = report.status === "pending";
  const canResolve = report.status === "reviewed";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--trackit-text-muted)]">
            Report #{report.id}
          </p>
          <h2 className="mt-1 text-lg font-bold text-[var(--trackit-navy)]">
            {report.reason}
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
            report.status,
          )}`}
        >
          {getStatusLabel(report.status)}
        </span>
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--trackit-text-muted)]">
            Reported item
          </p>
          <Link
            to={`/items/${report.item_id}`}
            className="mt-1 inline-flex font-semibold text-[var(--trackit-blue)] hover:underline"
          >
            Item #{report.item_id}
          </Link>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--trackit-text-muted)]">
            Reporter
          </p>
          <p className="mt-1 font-semibold text-[var(--trackit-navy)]">
            @{report.reporter.username} · User #{report.reporter.id}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--trackit-text-muted)]">
            Submitted
          </p>
          <p className="mt-1 text-sm text-[var(--trackit-text)]">
            {formatDate(report.created_at)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--trackit-text-muted)]">
            Last updated
          </p>
          <p className="mt-1 text-sm text-[var(--trackit-text)]">
            {formatDate(report.updated_at)}
          </p>
        </div>
      </div>

      <div className="mt-5 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
          Description
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--trackit-text)]">
          {report.description}
        </p>
      </div>

      {report.resolution_note ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-300">
            Resolution note
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-emerald-950 dark:text-emerald-100">
            {report.resolution_note}
          </p>
        </div>
      ) : null}

      {report.reviewed_at ? (
        <p className="mt-4 text-xs text-[var(--trackit-text-muted)]">
          Reviewed {formatDate(report.reviewed_at)}
          {report.reviewed_by ? ` by User #${report.reviewed_by}` : ""}
        </p>
      ) : null}

      {reviewError ? (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
        >
          <p className="font-bold">Could not mark this report as reviewed</p>
          <p className="mt-1">{reviewError}</p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {canReview ? (
          <button
            type="button"
            onClick={() => onReview(report.id)}
            disabled={isReviewing}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReviewing ? "Reviewing…" : "Mark as reviewed"}
          </button>
        ) : null}

        {canResolve ? (
          <button
            type="button"
            onClick={() => onResolve(report)}
            disabled={isResolving}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResolving ? "Resolving…" : "Resolve report"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function ModeratorReportsPage() {
  const { accessToken } = useAuth();

  const pendingReportsQuery = usePendingReports(accessToken);
  const reviewedReportsQuery = useReviewedReports(accessToken);
  const reviewReportMutation = useReviewReport(accessToken);
  const resolveReportMutation = useResolveReport(accessToken);

  const [reportToResolve, setReportToResolve] =
    useState<ModerationReport | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolveError, setResolveError] = useState<string | null>(null);

  const pendingReports = pendingReportsQuery.data ?? [];
  const reviewedReports = reviewedReportsQuery.data ?? [];

  const isLoading =
    pendingReportsQuery.isLoading || reviewedReportsQuery.isLoading;

  const queryError =
    pendingReportsQuery.error ?? reviewedReportsQuery.error ?? null;

  const isReviewing = reviewReportMutation.isPending;
  const isResolving = resolveReportMutation.isPending;

  function handleReview(reportId: number) {
    reviewReportMutation.reset();

    reviewReportMutation.mutate({ reportId });
  }

  function openResolveDialog(report: ModerationReport) {
    setReportToResolve(report);
    setResolutionNote("");
    setResolveError(null);
  }

  function closeResolveDialog() {
    if (isResolving) {
      return;
    }

    setReportToResolve(null);
    setResolutionNote("");
    setResolveError(null);
  }

  function handleResolve(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNote = resolutionNote.trim();

    if (trimmedNote.length < 5) {
      setResolveError("Resolution note must be at least 5 characters.");
      return;
    }

    if (trimmedNote.length > 2000) {
      setResolveError("Resolution note cannot exceed 2000 characters.");
      return;
    }

    if (!reportToResolve) {
      return;
    }

    setResolveError(null);

    resolveReportMutation.mutate(
      {
        reportId: reportToResolve.id,
        payload: {
          resolution_note: trimmedNote,
        },
      },
      {
        onSuccess: () => {
          closeResolveDialog();
        },
        onError: (error) => {
          setResolveError(getApiErrorMessage(error));
        },
      },
    );
  }

  function retryQueries() {
    void pendingReportsQuery.refetch();
    void reviewedReportsQuery.refetch();
  }

  function getReviewError(reportId: number): string | null {
    if (
      !reviewReportMutation.isError ||
      reviewReportMutation.variables?.reportId !== reportId
    ) {
      return null;
    }

    return getApiErrorMessage(reviewReportMutation.error);
  }

  return (
    <div className="min-h-screen bg-[var(--trackit-surface)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
              Moderation
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
              Reports
            </h1>
            <p className="mt-3 text-base leading-7 text-[var(--trackit-text-muted)]">
              Review community reports and record the outcome of reports that
              require moderator attention.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:max-w-xl">
            <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-4">
              <p className="text-sm text-[var(--trackit-text-muted)]">
                Pending reports
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--trackit-navy)]">
                {pendingReports.length}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-4">
              <p className="text-sm text-[var(--trackit-text-muted)]">
                Reviewed reports
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--trackit-navy)]">
                {reviewedReports.length}
              </p>
            </div>
          </div>
        </header>

        {queryError ? (
          <section className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
            <h2 className="text-lg font-bold text-red-900 dark:text-red-200">
              We could not load the reports
            </h2>
            <p className="mt-2 text-sm leading-6 text-red-800 dark:text-red-300">
              {getApiErrorMessage(queryError)}
            </p>
            <button
              type="button"
              onClick={retryQueries}
              className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try again
            </button>
          </section>
        ) : null}

        <section aria-labelledby="pending-reports-heading">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="pending-reports-heading"
                className="text-2xl font-bold text-[var(--trackit-navy)]"
              >
                Pending review
              </h2>
              <p className="mt-1 text-sm text-[var(--trackit-text-muted)]">
                Reports waiting for moderator review.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <ReportSkeleton key={index} />
              ))}
            </div>
          ) : pendingReports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--trackit-surface-blue)] text-[var(--trackit-blue)]">
                ✓
              </div>
              <h3 className="mt-4 text-lg font-bold text-[var(--trackit-navy)]">
                No pending reports
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--trackit-text-muted)]">
                Everything currently in the report queue has been reviewed.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {pendingReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onReview={handleReview}
                  onResolve={openResolveDialog}
                  isReviewing={
                    isReviewing &&
                    reviewReportMutation.variables?.reportId === report.id
                  }
                  isResolving={
                    isResolving &&
                    resolveReportMutation.variables?.reportId === report.id
                  }
                  reviewError={getReviewError(report.id)}
                />
              ))}
            </div>
          )}
        </section>

        <section
          aria-labelledby="reviewed-reports-heading"
          className="mt-12"
        >
          <div className="mb-4">
            <h2
              id="reviewed-reports-heading"
              className="text-2xl font-bold text-[var(--trackit-navy)]"
            >
              Reviewed reports
            </h2>
            <p className="mt-1 text-sm text-[var(--trackit-text-muted)]">
              Reports that have been reviewed and can be resolved.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <ReportSkeleton key={index} />
              ))}
            </div>
          ) : reviewedReports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-[var(--trackit-navy)]">
                No reviewed reports
              </h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--trackit-text-muted)]">
                Reports marked as reviewed will appear here until they are
                resolved.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {reviewedReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onReview={handleReview}
                  onResolve={openResolveDialog}
                  isReviewing={
                    isReviewing &&
                    reviewReportMutation.variables?.reportId === report.id
                  }
                  isResolving={
                    isResolving &&
                    resolveReportMutation.variables?.reportId === report.id
                  }
                  reviewError={getReviewError(report.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {reportToResolve ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeResolveDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="resolve-report-title"
            className="w-full max-w-lg rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-2xl"
          >
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                Resolve report
              </p>
              <h2
                id="resolve-report-title"
                className="mt-2 text-2xl font-bold text-[var(--trackit-navy)]"
              >
                Record the resolution
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Report #{reportToResolve.id} for Item #{reportToResolve.item_id}
                . Add a concise note explaining the moderator resolution.
              </p>
            </div>

            <form onSubmit={handleResolve} className="mt-6">
              <label
                htmlFor="resolution-note"
                className="block text-sm font-semibold text-[var(--trackit-navy)]"
              >
                Resolution note
              </label>

              <textarea
                id="resolution-note"
                value={resolutionNote}
                onChange={(event) => {
                  setResolutionNote(event.target.value);
                  if (resolveError) {
                    setResolveError(null);
                  }
                }}
                rows={6}
                maxLength={2000}
                disabled={isResolving}
                placeholder="Explain what was done with this report."
                className="mt-2 block w-full resize-y rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 py-3 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-blue-bright)] focus:ring-2 focus:ring-[var(--trackit-blue-bright)]/20 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-[var(--trackit-text-muted)]">
                <span>Minimum 5 characters</span>
                <span>{resolutionNote.length}/2000</span>
              </div>

              {resolveError ? (
                <p
                  role="alert"
                  className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"
                >
                  {resolveError}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeResolveDialog}
                  disabled={isResolving}
                  className="rounded-xl border border-[var(--trackit-border)] px-4 py-2.5 text-sm font-semibold text-[var(--trackit-text)] transition-colors hover:bg-[var(--trackit-surface-blue)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isResolving || resolutionNote.trim().length < 5}
                  className="rounded-xl bg-[var(--trackit-blue)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResolving ? "Resolving…" : "Resolve report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}