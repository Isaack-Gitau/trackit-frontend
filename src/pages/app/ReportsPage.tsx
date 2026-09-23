import {
  useState,
} from "react";
import {
  Link,
} from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";
import {
  useAuth,
} from "../../context/AuthContext";
import {
  useMyReports,
  useWithdrawReport,
} from "../../hooks/useReports";
import type {
  Report,
  ReportStatus,
} from "../../types/report";

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}

function getStatusLabel(
  status: ReportStatus,
): string {
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

function getStatusClasses(
  status: ReportStatus,
): string {
  switch (status) {
    case "pending":
      return [
        "border-amber-200",
        "bg-amber-50",
        "text-amber-800",
      ].join(" ");

    case "reviewed":
      return [
        "border-blue-200",
        "bg-blue-50",
        "text-blue-800",
      ].join(" ");

    case "resolved":
      return [
        "border-emerald-200",
        "bg-emerald-50",
        "text-emerald-800",
      ].join(" ");

    case "withdrawn":
      return [
        "border-slate-200",
        "bg-slate-100",
        "text-slate-700",
      ].join(" ");

    default:
      return [
        "border-[var(--trackit-border)]",
        "bg-[var(--trackit-surface)]",
        "text-[var(--trackit-text)]",
      ].join(" ");
  }
}

function ReportStatusBadge({
  status,
}: {
  status: ReportStatus;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border",
        "px-2.5 py-1 text-xs font-semibold",
        getStatusClasses(status),
      ].join(" ")}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function ReportCard({
  report,
  isWithdrawing,
  onWithdraw,
}: {
  report: Report;
  isWithdrawing: boolean;
  onWithdraw: (reportId: number) => void;
}) {
  return (
    <article
      className={[
        "rounded-2xl border",
        "border-[var(--trackit-border)]",
        "bg-[var(--trackit-surface-card)]",
        "p-5 shadow-sm sm:p-6",
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--trackit-text-muted)]">
            Report #{report.id}
          </p>

          <h2 className="mt-2 text-lg font-bold text-[var(--trackit-navy)]">
            {report.reason}
          </h2>
        </div>

        <ReportStatusBadge status={report.status} />
      </div>

      <div className="mt-5 rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
          Report details
        </p>

        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--trackit-text)]">
          {report.description}
        </p>
      </div>

      <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
            Reported post
          </p>

          <p className="mt-1 font-semibold text-[var(--trackit-navy)]">
            Post #{report.item_id}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
            Submitted
          </p>

          <p className="mt-1 text-[var(--trackit-text)]">
            {formatDate(report.created_at)}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--trackit-border)] pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-[var(--trackit-text-muted)]">
            {report.status === "pending" ? (
              <p>
                Your report is waiting for administrative review.
              </p>
            ) : report.status === "reviewed" ? (
              <p>
                Your report has been reviewed and is awaiting resolution.
              </p>
            ) : report.status === "resolved" ? (
              <p>
                This report has been resolved.
              </p>
            ) : (
              <p>
                You withdrew this report before it was reviewed.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/items/${report.item_id}`}
              className={[
                "inline-flex min-h-10 items-center justify-center",
                "rounded-lg px-3 text-sm font-semibold",
                "text-[var(--trackit-blue)]",
                "hover:bg-[var(--trackit-blue-soft)]",
                "hover:text-[var(--trackit-blue-hover)]",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-[var(--trackit-blue-bright)]",
              ].join(" ")}
            >
              View post
            </Link>

            {report.status === "pending" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={isWithdrawing}
                disabled={isWithdrawing}
                className={[
                  "!border-red-300",
                  "!text-red-700",
                  "hover:!bg-red-50",
                  "hover:!text-red-800",
                ].join(" ")}
                onClick={() => {
                  onWithdraw(report.id);
                }}
              >
                Withdraw report
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {report.reviewed_at ? (
        <div className="mt-5 border-t border-[var(--trackit-border)] pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
            Reviewed
          </p>

          <p className="mt-1 text-sm text-[var(--trackit-text)]">
            {formatDate(report.reviewed_at)}
          </p>
        </div>
      ) : null}

      {report.resolution_note ? (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800">
            Resolution note
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-emerald-950">
            {report.resolution_note}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function ReportCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-card)] p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-6 w-56 max-w-full" />
        </div>

        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      <Skeleton className="mt-5 h-28 w-full rounded-xl" />

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-5 w-20" />
        </div>

        <div>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-5 w-40 max-w-full" />
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--trackit-border)] pt-5">
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
    </div>
  );
}

function WithdrawReportModal({
  isOpen,
  isWithdrawing,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  isWithdrawing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--trackit-navy)]/55 px-5 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isWithdrawing) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-report-title"
        aria-describedby="withdraw-report-description"
        className="w-full max-w-md rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-card)] p-6 shadow-2xl sm:p-7"
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-700">
          <span
            aria-hidden="true"
            className="text-xl font-bold"
          >
            !
          </span>
        </div>

        <h2
          id="withdraw-report-title"
          className="mt-5 text-xl font-bold tracking-tight text-[var(--trackit-navy)]"
        >
          Withdraw this report?
        </h2>

        <p
          id="withdraw-report-description"
          className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]"
        >
          It will no longer be reviewed, but it will remain in your
          report history. You can submit a new report later if the
          issue still needs attention.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isWithdrawing}
            className="!border-[var(--trackit-border)] !text-[var(--trackit-navy)] hover:!bg-[var(--trackit-surface)]"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            loading={isWithdrawing}
            disabled={isWithdrawing}
            className="!bg-red-600 !text-white hover:!bg-red-700"
            onClick={onConfirm}
          >
            Withdraw report
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const {
    accessToken,
  } = useAuth();

  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawingReportId, setWithdrawingReportId] = useState<
    number | null
  >(null);
  const [withdrawConfirmReportId, setWithdrawConfirmReportId] =
    useState<number | null>(null);

  const {
    data: reports,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useMyReports(accessToken);

  const withdrawMutation = useWithdrawReport(
    accessToken,
  );

  const reportList = reports ?? [];

  function handleWithdraw(
    reportId: number,
  ) {
    setWithdrawError("");
    setWithdrawConfirmReportId(reportId);
  }

  function handleConfirmWithdraw() {
    if (withdrawConfirmReportId === null) {
      return;
    }

    const reportId = withdrawConfirmReportId;

    setWithdrawError("");
    setWithdrawingReportId(reportId);

    withdrawMutation.mutate(
      reportId,
      {
        onSuccess: () => {
          setWithdrawingReportId(null);
          setWithdrawConfirmReportId(null);
        },

        onError: (mutationError) => {
          setWithdrawingReportId(null);

          setWithdrawError(
            mutationError instanceof Error
              ? mutationError.message
              : "We could not withdraw this report. Please try again.",
          );
        },
      },
    );
  }

  function handleCancelWithdraw() {
    if (withdrawMutation.isPending) {
      return;
    }

    setWithdrawConfirmReportId(null);
  }

  const isWithdrawing =
    withdrawingReportId !== null &&
    withdrawMutation.isPending;

  return (
    <>
      <main className="min-h-[calc(100vh-4rem)] bg-[var(--trackit-surface)] px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mx-auto w-full max-w-5xl">
          <header className="rounded-3xl bg-[var(--trackit-deep-navy)] p-6 text-white shadow-sm sm:p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
              Reports
            </p>

            <div className="mt-4 max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Help keep TrackIt safe and useful.
              </h1>

              <p className="mt-4 text-base leading-8 text-[var(--trackit-text-on-dark)]">
                Reports are for raising concerns about posts that may
                violate TrackIt's rules or need administrative attention.
                You can follow the status of reports you have submitted
                from here.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button
                href="/discover"
                variant="primary"
                size="sm"
              >
                Discover posts
              </Button>

              <Button
                href="/dashboard"
                variant="outline"
                size="sm"
                className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10 hover:!text-white"
              >
                Back to dashboard
              </Button>
            </div>
          </header>

          <section className="mt-8 sm:mt-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--trackit-navy)]">
                  My reports
                </h2>

                <p className="mt-1 text-sm text-[var(--trackit-text-muted)]">
                  Review the reports you have submitted and their current status.
                </p>
              </div>

              {isFetching && !isLoading ? (
                <span className="text-xs font-medium text-[var(--trackit-text-muted)]">
                  Updating…
                </span>
              ) : null}
            </div>

            {withdrawError ? (
              <div
                role="alert"
                className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4"
              >
                <p className="text-sm font-semibold text-red-900">
                  We couldn't withdraw the report.
                </p>

                <p className="mt-1 text-sm leading-6 text-red-800">
                  {withdrawError}
                </p>
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-5 space-y-4">
                <ReportCardSkeleton />
                <ReportCardSkeleton />
              </div>
            ) : isError ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-6">
                <h3 className="text-lg font-bold text-red-900">
                  We couldn't load your reports.
                </h3>

                <p className="mt-2 text-sm leading-6 text-red-800">
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong while loading your reports."}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-5 !border-red-300 !text-red-800 hover:!bg-red-100"
                  onClick={() => {
                    void refetch();
                  }}
                >
                  Try again
                </Button>
              </div>
            ) : reportList.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-card)] p-8 text-center shadow-sm sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]">
                  <span
                    aria-hidden="true"
                    className="text-2xl"
                  >
                    !
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-[var(--trackit-navy)]">
                  You haven't submitted any reports.
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[var(--trackit-text-muted)]">
                  If you come across a post that needs administrative
                  attention, you can report it from the post's details page.
                </p>

                <div className="mt-6">
                  <Button
                    href="/discover"
                    variant="primary"
                    size="sm"
                  >
                    Discover posts
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {reportList.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    isWithdrawing={
                      withdrawingReportId === report.id &&
                      withdrawMutation.isPending
                    }
                    onWithdraw={handleWithdraw}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-card)] p-5 sm:p-6">
            <h2 className="text-base font-bold text-[var(--trackit-navy)]">
              A note about reports
            </h2>

            <p className="mt-2 text-sm leading-7 text-[var(--trackit-text-muted)]">
              Reports are reviewed through TrackIt's administrative
              workflow. Submitting a report does not automatically remove
              or change a post. Please provide clear, factual information
              so the issue can be assessed appropriately.
            </p>
          </section>
        </div>
      </main>

      <WithdrawReportModal
        isOpen={withdrawConfirmReportId !== null}
        isWithdrawing={isWithdrawing}
        onCancel={handleCancelWithdraw}
        onConfirm={handleConfirmWithdraw}
      />
    </>
  );
}
