import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../api/errors";
import {
  useApproveClaim,
  useApproveItem,
  usePendingClaims,
  usePendingReports,
  useModerationItems,
  useRejectClaim,
  useRejectItem,
  useResolveReport,
  useReviewReport,
  useReviewedReports,
} from "../../hooks/useModeration";
import { useAuth } from "../../context/AuthContext";
import { getMediaUrl } from "../../api/config";
import type { Item, ItemStatus, ItemType } from "../../types/item";
import type { ModerationClaim } from "../../types/claim";
import type { ModerationReport } from "../../types/report";

type ModerationSection = "items" | "claims" | "reports";

type StatusFilter = "pending" | ItemStatus | "all";
type TypeFilter = "lost" | "found" | "all";

const REJECTION_REASON_MIN_LENGTH = 3;
const REJECTION_REASON_MAX_LENGTH = 2000;
const CLAIM_REJECTION_MIN_LENGTH = 10;
const CLAIM_REJECTION_MAX_LENGTH = 2000;
const RESOLUTION_NOTE_MIN_LENGTH = 5;
const RESOLUTION_NOTE_MAX_LENGTH = 2000;

function formatDate(value: string | null | undefined): string {
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

function getStatusLabel(status: ItemStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "claimed":
      return "Claimed";
    default:
      return status;
  }
}

function getTypeLabel(type: ItemType): string {
  return type === "lost" ? "Lost" : "Found";
}

function StatusBadge({ status }: { status: ItemStatus }) {
  const classes =
    status === "pending"
      ? "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200"
      : status === "approved"
        ? "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-200"
        : status === "claimed"
          ? "bg-purple-50 text-purple-800 ring-1 ring-inset ring-purple-200"
          : "bg-red-50 text-red-800 ring-1 ring-inset ring-red-200";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${classes}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function TypeBadge({ type }: { type: ItemType }) {
  return (
    <span className="inline-flex rounded-full bg-[var(--trackit-blue-soft)] px-2.5 py-1 text-xs font-bold text-[var(--trackit-blue)]">
      {getTypeLabel(type)}
    </span>
  );
}

function ItemCard({
  item,
  isApproving,
  isRejecting,
  approveError,
  onApprove,
  onReject,
}: {
  item: Item;
  isApproving: boolean;
  isRejecting: boolean;
  approveError: string | null;
  onApprove: (item: Item) => void;
  onReject: (item: Item) => void;
}) {
  const isPending = item.status === "pending";
  const isBusy = isApproving || isRejecting;
  const imageUrl = getMediaUrl(item.image);

  return (
    <article className="overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm">
      <div className="aspect-[16/10] overflow-hidden bg-[var(--trackit-surface-blue)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--trackit-text-muted)]">
            No item image
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          <TypeBadge type={item.type} />
          <StatusBadge status={item.status} />
        </div>

        <h3 className="mt-4 line-clamp-2 text-lg font-extrabold text-[var(--trackit-navy)]">
          {item.title}
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
          {item.description}
        </p>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="font-bold text-[var(--trackit-navy)]">
              Category:
            </dt>
            <dd className="text-[var(--trackit-text-muted)]">
              {item.category}
            </dd>
          </div>

          <div className="flex gap-2">
            <dt className="font-bold text-[var(--trackit-navy)]">
              Location:
            </dt>
            <dd className="text-[var(--trackit-text-muted)]">
              {item.location}
            </dd>
          </div>

          <div className="flex gap-2">
            <dt className="font-bold text-[var(--trackit-navy)]">
              Posted:
            </dt>
            <dd className="text-[var(--trackit-text-muted)]">
              {formatDate(item.created_at)}
            </dd>
          </div>
        </dl>

        {approveError ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
          >
            {approveError}
          </div>
        ) : null}

        {isPending ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onApprove(item)}
              disabled={isBusy}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isApproving ? "Approving..." : "Approve"}
            </button>

            <button
              type="button"
              onClick={() => onReject(item)}
              disabled={isBusy}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-4 text-sm font-bold text-[var(--trackit-danger-text)] transition hover:border-[var(--trackit-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Reject
            </button>
          </div>
        ) : (
          <Link
            to={`/items/${item.id}`}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
          >
            View post
          </Link>
        )}
      </div>
    </article>
  );
}

function ClaimCard({
  claim,
  isApproving,
  isRejecting,
  approveError,
  onApprove,
  onReject,
}: {
  claim: ModerationClaim;
  isApproving: boolean;
  isRejecting: boolean;
  approveError: string | null;
  onApprove: (claim: ModerationClaim) => void;
  onReject: (claim: ModerationClaim) => void;
}) {
  const imageUrl = getMediaUrl(claim.item.image);
  const isBusy = isApproving || isRejecting;

  return (
    <article className="overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm">
      <div className="aspect-[16/10] overflow-hidden bg-[var(--trackit-surface-blue)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={claim.item.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-[var(--trackit-text-muted)]">
            No item image
          </div>
        )}
      </div>

      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-blue)]">
          Claim #{claim.id}
        </p>

        <h3 className="mt-2 line-clamp-2 text-lg font-extrabold text-[var(--trackit-navy)]">
          {claim.item.title}
        </h3>

        <div className="mt-4 rounded-2xl bg-[var(--trackit-surface-blue)] px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
            Claimant
          </p>
          <p className="mt-1 text-sm font-bold text-[var(--trackit-navy)]">
            @{claim.claimant.username} · User #{claim.claimant.id}
          </p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
            Claim reason
          </p>
          <p className="mt-2 line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-[var(--trackit-text)]">
            {claim.reason}
          </p>
        </div>

        {approveError ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
          >
            {approveError}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onApprove(claim)}
            disabled={isBusy}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isApproving ? "Approving..." : "Approve"}
          </button>

          <button
            type="button"
            onClick={() => onReject(claim)}
            disabled={isBusy}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-4 text-sm font-bold text-[var(--trackit-danger-text)] transition hover:border-[var(--trackit-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ReportCard({
  report,
  isReviewing,
  isResolving,
  reviewError,
  onReview,
  onResolve,
}: {
  report: ModerationReport;
  isReviewing: boolean;
  isResolving: boolean;
  reviewError: string | null;
  onReview: (report: ModerationReport) => void;
  onResolve: (report: ModerationReport) => void;
}) {
  const statusLabel =
    report.status === "pending"
      ? "Pending"
      : report.status === "reviewed"
        ? "Reviewed"
        : "Resolved";

  return (
    <article className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-blue)]">
          Report #{report.id}
        </p>

        <span className="rounded-full bg-[var(--trackit-surface-blue)] px-2.5 py-1 text-xs font-bold text-[var(--trackit-navy)]">
          {statusLabel}
        </span>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div>
          <dt className="font-bold text-[var(--trackit-navy)]">
            Reporter
          </dt>
          <dd className="mt-1 text-[var(--trackit-text-muted)]">
            @{report.reporter.username} · User #{report.reporter.id}
          </dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--trackit-navy)]">
            Item
          </dt>
          <dd className="mt-1">
            <Link
              to={`/items/${report.item_id}`}
              className="font-semibold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)]"
            >
              View reported item
            </Link>
          </dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--trackit-navy)]">
            Reason
          </dt>
          <dd className="mt-1 text-[var(--trackit-text-muted)]">
            {report.reason}
          </dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--trackit-navy)]">
            Description
          </dt>
          <dd className="mt-1 whitespace-pre-wrap leading-6 text-[var(--trackit-text)]">
            {report.description}
          </dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--trackit-navy)]">
            Submitted
          </dt>
          <dd className="mt-1 text-[var(--trackit-text-muted)]">
            {formatDate(report.created_at)}
          </dd>
        </div>
      </dl>

      {report.resolution_note ? (
        <div className="mt-5 rounded-2xl bg-[var(--trackit-surface-blue)] px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-blue)]">
            Resolution
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--trackit-text)]">
            {report.resolution_note}
          </p>
        </div>
      ) : null}

      {reviewError ? (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
        >
          {reviewError}
        </div>
      ) : null}

      {report.status === "pending" ? (
        <button
          type="button"
          onClick={() => onReview(report)}
          disabled={isReviewing}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isReviewing ? "Marking as reviewed..." : "Mark as reviewed"}
        </button>
      ) : report.status === "reviewed" ? (
        <button
          type="button"
          onClick={() => onResolve(report)}
          disabled={isResolving}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResolving ? "Resolving..." : "Resolve report"}
        </button>
      ) : null}
    </article>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8"
        >
          <path d="m9 11 3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </div>

      <h3 className="mt-6 text-xl font-extrabold text-[var(--trackit-navy)]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[var(--trackit-text-muted)]">
        {description}
      </p>
    </div>
  );
}

function ErrorState({
  title,
  error,
  onRetry,
}: {
  title: string;
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center"
    >
      <h3 className="text-lg font-bold text-red-900">{title}</h3>

      <p className="mt-2 text-sm leading-7 text-red-800">
        {getApiErrorMessage(error)}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 min-h-11 rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
      >
        Try again
      </button>
    </div>
  );
}

export function AdminModerationPage() {
  const { accessToken } = useAuth();

  const [section, setSection] =
    useState<ModerationSection>("items");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("pending");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  const [rejectingItem, setRejectingItem] =
    useState<Item | null>(null);
  const [itemRejectionReason, setItemRejectionReason] =
    useState("");

  const [rejectingClaim, setRejectingClaim] =
    useState<ModerationClaim | null>(null);
  const [claimRejectionReason, setClaimRejectionReason] =
    useState("");

  const [resolvingReport, setResolvingReport] =
    useState<ModerationReport | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const itemFilters = {
    search: search || undefined,
    type:
      typeFilter === "all" ? undefined : typeFilter,
    status:
      statusFilter === "all" ? undefined : statusFilter,
    category: category.trim() || undefined,
    location: location.trim() || undefined,
    page: 1,
    limit: 20,
  };

  const itemsQuery = useModerationItems(
    itemFilters,
    accessToken,
  );

  const claimsQuery = usePendingClaims(accessToken);
  const pendingReportsQuery =
    usePendingReports(accessToken);
  const reviewedReportsQuery =
    useReviewedReports(accessToken);

  const approveItemMutation =
    useApproveItem(accessToken);
  const rejectItemMutation =
    useRejectItem(accessToken);

  const approveClaimMutation =
    useApproveClaim(accessToken);
  const rejectClaimMutation =
    useRejectClaim(accessToken);

  const reviewReportMutation =
    useReviewReport(accessToken);
  const resolveReportMutation =
    useResolveReport(accessToken);

  const items = itemsQuery.data ?? [];
  const claims = claimsQuery.data ?? [];
  const pendingReports =
    pendingReportsQuery.data ?? [];
  const reviewedReports =
    reviewedReportsQuery.data ?? [];

  function openRejectItemDialog(item: Item) {
    approveItemMutation.reset();
    rejectItemMutation.reset();
    setItemRejectionReason("");
    setRejectingItem(item);
  }

  function closeRejectItemDialog() {
    if (rejectItemMutation.isPending) {
      return;
    }

    rejectItemMutation.reset();
    setRejectingItem(null);
    setItemRejectionReason("");
  }

  function handleApproveItem(item: Item) {
    approveItemMutation.reset();

    approveItemMutation.mutate({
      itemId: item.id,
    });
  }

  function handleRejectItem() {
    if (!rejectingItem) {
      return;
    }

    const reason = itemRejectionReason.trim();

    if (
      reason.length <
        REJECTION_REASON_MIN_LENGTH ||
      reason.length >
        REJECTION_REASON_MAX_LENGTH
    ) {
      return;
    }

    rejectItemMutation.mutate(
      {
        itemId: rejectingItem.id,
        payload: { reason },
      },
      {
        onSuccess: closeRejectItemDialog,
      },
    );
  }

  function openRejectClaimDialog(
    claim: ModerationClaim,
  ) {
    approveClaimMutation.reset();
    rejectClaimMutation.reset();
    setClaimRejectionReason("");
    setRejectingClaim(claim);
  }

  function closeRejectClaimDialog() {
    if (rejectClaimMutation.isPending) {
      return;
    }

    rejectClaimMutation.reset();
    setRejectingClaim(null);
    setClaimRejectionReason("");
  }

  function handleApproveClaim(claim: ModerationClaim) {
    approveClaimMutation.reset();
    rejectClaimMutation.reset();

    approveClaimMutation.mutate({
      claimId: claim.id,
    });
  }

  function handleRejectClaim() {
    if (!rejectingClaim) {
      return;
    }

    const reason = claimRejectionReason.trim();

    if (
      reason.length < CLAIM_REJECTION_MIN_LENGTH ||
      reason.length > CLAIM_REJECTION_MAX_LENGTH
    ) {
      return;
    }

    rejectClaimMutation.mutate(
      {
        claimId: rejectingClaim.id,
        payload: {
          rejection_reason: reason,
        },
      },
      {
        onSuccess: closeRejectClaimDialog,
      },
    );
  }

  function handleReviewReport(report: ModerationReport) {
    reviewReportMutation.reset();

    reviewReportMutation.mutate({
      reportId: report.id,
    });
  }

  function openResolveReportDialog(
    report: ModerationReport,
  ) {
    reviewReportMutation.reset();
    resolveReportMutation.reset();
    setResolutionNote("");
    setResolvingReport(report);
  }

  function closeResolveReportDialog() {
    if (resolveReportMutation.isPending) {
      return;
    }

    resolveReportMutation.reset();
    setResolvingReport(null);
    setResolutionNote("");
  }

  function handleResolveReport() {
    if (!resolvingReport) {
      return;
    }

    const note = resolutionNote.trim();

    if (
      note.length < RESOLUTION_NOTE_MIN_LENGTH ||
      note.length > RESOLUTION_NOTE_MAX_LENGTH
    ) {
      return;
    }

    resolveReportMutation.mutate(
      {
        reportId: resolvingReport.id,
        payload: {
          resolution_note: note,
        },
      },
      {
        onSuccess: closeResolveReportDialog,
      },
    );
  }

  function clearItemFilters() {
    setSearchInput("");
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("pending");
    setCategory("");
    setLocation("");
  }

  const itemFilterCount =
    (search ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (category.trim() ? 1 : 0) +
    (location.trim() ? 1 : 0);

  const itemRejectionLength =
    itemRejectionReason.trim().length;

  const canRejectItem =
    itemRejectionLength >=
      REJECTION_REASON_MIN_LENGTH &&
    itemRejectionLength <=
      REJECTION_REASON_MAX_LENGTH &&
    !rejectItemMutation.isPending;

  const claimRejectionLength =
    claimRejectionReason.trim().length;

  const canRejectClaim =
    claimRejectionLength >=
      CLAIM_REJECTION_MIN_LENGTH &&
    claimRejectionLength <=
      CLAIM_REJECTION_MAX_LENGTH &&
    !rejectClaimMutation.isPending;

  const resolutionLength = resolutionNote.trim().length;

  const canResolveReport =
    resolutionLength >= RESOLUTION_NOTE_MIN_LENGTH &&
    resolutionLength <= RESOLUTION_NOTE_MAX_LENGTH &&
    !resolveReportMutation.isPending;

  return (
    <>
      <main className="min-h-[70vh] bg-[var(--trackit-surface)] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-7xl">
          <section>
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
                Administration
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl lg:text-5xl">
                Moderation
              </h1>

              <p className="mt-4 text-base leading-7 text-[var(--trackit-text-muted)] sm:text-lg">
                Review TrackIt submissions, claims, and reports
                using the same moderation rules available to
                moderators.
              </p>
            </div>
          </section>

          <section
            aria-label="Moderation sections"
            className="mt-10 overflow-x-auto rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-2 shadow-sm"
          >
            <div className="flex min-w-max gap-2">
              {(
                [
                  ["items", "Items"],
                  ["claims", "Claims"],
                  ["reports", "Reports"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSection(value)}
                  className={[
                    "min-h-11 rounded-xl px-5 text-sm font-bold transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
                    section === value
                      ? "bg-[var(--trackit-blue)] !text-white"
                      : "text-[var(--trackit-text-muted)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue)]",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {section === "items" ? (
            <section className="mt-10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                    Item queue
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold text-[var(--trackit-navy)]">
                    Review submissions
                  </h2>
                </div>

                {itemsQuery.isSuccess ? (
                  <p className="text-sm text-[var(--trackit-text-muted)]">
                    Showing {items.length} items on this page
                  </p>
                ) : null}
              </div>

              <div className="mt-7 rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--trackit-text-muted)]">
                      Filters
                    </p>
                    <h3 className="mt-1 text-xl font-extrabold text-[var(--trackit-navy)]">
                      Find submissions
                    </h3>
                  </div>

                  {itemFilterCount > 0 ? (
                    <button
                      type="button"
                      onClick={clearItemFilters}
                      className="self-start rounded-lg px-3 py-2 text-sm font-bold !text-[var(--trackit-blue)] transition hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] sm:self-auto"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div>
                    <label
                      htmlFor="admin-moderation-search"
                      className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                    >
                      Search
                    </label>
                    <input
                      id="admin-moderation-search"
                      type="search"
                      value={searchInput}
                      onChange={(event) =>
                        setSearchInput(event.target.value)
                      }
                      placeholder="Search title or description"
                      maxLength={100}
                      className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-input-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-moderation-status"
                      className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                    >
                      Status
                    </label>
                    <select
                      id="admin-moderation-status"
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(
                          event.target.value as StatusFilter,
                        )
                      }
                      className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-input-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                    >
                      <option value="pending">
                        Pending review
                      </option>
                      <option value="approved">
                        Approved
                      </option>
                      <option value="rejected">
                        Rejected
                      </option>
                      <option value="claimed">
                        Claimed
                      </option>
                      <option value="all">
                        All statuses
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="admin-moderation-type"
                      className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                    >
                      Post type
                    </label>
                    <select
                      id="admin-moderation-type"
                      value={typeFilter}
                      onChange={(event) =>
                        setTypeFilter(
                          event.target.value as TypeFilter,
                        )
                      }
                      className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-input-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                    >
                      <option value="all">All types</option>
                      <option value="lost">Lost items</option>
                      <option value="found">Found items</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="admin-moderation-category"
                      className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                    >
                      Category
                    </label>
                    <input
                      id="admin-moderation-category"
                      type="text"
                      value={category}
                      onChange={(event) =>
                        setCategory(event.target.value)
                      }
                      placeholder="Filter by category"
                      maxLength={100}
                      className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-input-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label
                      htmlFor="admin-moderation-location"
                      className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                    >
                      Location
                    </label>
                    <input
                      id="admin-moderation-location"
                      type="text"
                      value={location}
                      onChange={(event) =>
                        setLocation(event.target.value)
                      }
                      placeholder="Filter by location"
                      maxLength={255}
                      className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-input-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                {itemsQuery.isLoading ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="h-[31rem] animate-pulse rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)]"
                        />
                      ),
                    )}
                  </div>
                ) : itemsQuery.isError ? (
                  <ErrorState
                    title="We couldn't load the moderation items"
                    error={itemsQuery.error}
                    onRetry={() => itemsQuery.refetch()}
                  />
                ) : items.length === 0 ? (
                  <EmptyState
                    title="No items match these filters"
                    description="Try clearing a filter or changing the review status to see more submissions."
                  />
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        isApproving={
                          approveItemMutation.isPending &&
                          approveItemMutation.variables?.itemId ===
                            item.id
                        }
                        isRejecting={
                          rejectItemMutation.isPending &&
                          rejectItemMutation.variables?.itemId ===
                            item.id
                        }
                        approveError={
                          approveItemMutation.isError &&
                          approveItemMutation.variables?.itemId ===
                            item.id
                            ? getApiErrorMessage(
                                approveItemMutation.error,
                              )
                            : null
                        }
                        onApprove={handleApproveItem}
                        onReject={openRejectItemDialog}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {section === "claims" ? (
            <section className="mt-10">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                    Claim queue
                  </p>
                  <h2 className="mt-2 text-3xl font-extrabold text-[var(--trackit-navy)]">
                    Pending claims
                  </h2>
                </div>

                {claimsQuery.isSuccess ? (
                  <p className="text-sm text-[var(--trackit-text-muted)]">
                    {claims.length}{" "}
                    {claims.length === 1 ? "claim" : "claims"}{" "}
                    awaiting review
                  </p>
                ) : null}
              </div>

              <div className="mt-7">
                {claimsQuery.isLoading ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="h-[31rem] animate-pulse rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)]"
                        />
                      ),
                    )}
                  </div>
                ) : claimsQuery.isError ? (
                  <ErrorState
                    title="We couldn't load the pending claims"
                    error={claimsQuery.error}
                    onRetry={() => claimsQuery.refetch()}
                  />
                ) : claims.length === 0 ? (
                  <EmptyState
                    title="No claims are waiting for review"
                    description="New claims submitted against found items will appear here when they require moderation."
                  />
                ) : (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {claims.map((claim) => (
                      <ClaimCard
                        key={claim.id}
                        claim={claim}
                        isApproving={
                          approveClaimMutation.isPending &&
                          approveClaimMutation.variables?.claimId ===
                            claim.id
                        }
                        isRejecting={
                          rejectClaimMutation.isPending &&
                          rejectClaimMutation.variables?.claimId ===
                            claim.id
                        }
                        approveError={
                          approveClaimMutation.isError &&
                          approveClaimMutation.variables?.claimId ===
                            claim.id
                            ? getApiErrorMessage(
                                approveClaimMutation.error,
                              )
                            : null
                        }
                        onApprove={handleApproveClaim}
                        onReject={openRejectClaimDialog}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {section === "reports" ? (
            <section className="mt-10">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Report queue
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-[var(--trackit-navy)]">
                  Review reports
                </h2>
              </div>

              <div className="mt-8">
                {pendingReportsQuery.isLoading ||
                reviewedReportsQuery.isLoading ? (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="h-[30rem] animate-pulse rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)]"
                        />
                      ),
                    )}
                  </div>
                ) : pendingReportsQuery.isError ||
                  reviewedReportsQuery.isError ? (
                  <ErrorState
                    title="We couldn't load the moderation reports"
                    error={
                      pendingReportsQuery.isError
                        ? pendingReportsQuery.error
                        : reviewedReportsQuery.error
                    }
                    onRetry={() => {
                      void pendingReportsQuery.refetch();
                      void reviewedReportsQuery.refetch();
                    }}
                  />
                ) : (
                  <div className="space-y-10">
                    <section aria-labelledby="admin-pending-reports-heading">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--trackit-text-muted)]">
                            Action required
                          </p>
                          <h3
                            id="admin-pending-reports-heading"
                            className="mt-1 text-2xl font-extrabold text-[var(--trackit-navy)]"
                          >
                            Pending reports
                          </h3>
                        </div>

                        <p className="text-sm text-[var(--trackit-text-muted)]">
                          {pendingReports.length}{" "}
                          {pendingReports.length === 1
                            ? "report"
                            : "reports"}
                        </p>
                      </div>

                      {pendingReports.length === 0 ? (
                        <div className="mt-5">
                          <EmptyState
                            title="No pending reports"
                            description="Reports requiring moderator attention will appear here."
                          />
                        </div>
                      ) : (
                        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          {pendingReports.map((report) => (
                            <ReportCard
                              key={report.id}
                              report={report}
                              isReviewing={
                                reviewReportMutation.isPending &&
                                reviewReportMutation.variables?.reportId ===
                                  report.id
                              }
                              isResolving={false}
                              reviewError={
                                reviewReportMutation.isError &&
                                reviewReportMutation.variables?.reportId ===
                                  report.id
                                  ? getApiErrorMessage(
                                      reviewReportMutation.error,
                                    )
                                  : null
                              }
                              onReview={handleReviewReport}
                              onResolve={openResolveReportDialog}
                            />
                          ))}
                        </div>
                      )}
                    </section>

                    <section aria-labelledby="admin-reviewed-reports-heading">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--trackit-text-muted)]">
                            Previously reviewed
                          </p>
                          <h3
                            id="admin-reviewed-reports-heading"
                            className="mt-1 text-2xl font-extrabold text-[var(--trackit-navy)]"
                          >
                            Reviewed reports
                          </h3>
                        </div>

                        <p className="text-sm text-[var(--trackit-text-muted)]">
                          {reviewedReports.length}{" "}
                          {reviewedReports.length === 1
                            ? "report"
                            : "reports"}
                        </p>
                      </div>

                      {reviewedReports.length === 0 ? (
                        <div className="mt-5">
                          <EmptyState
                            title="No reviewed reports"
                            description="Reports marked as reviewed will appear here until they are resolved."
                          />
                        </div>
                      ) : (
                        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                          {reviewedReports.map((report) => (
                            <ReportCard
                              key={report.id}
                              report={report}
                              isReviewing={false}
                              isResolving={
                                resolveReportMutation.isPending &&
                                resolveReportMutation.variables?.reportId ===
                                  report.id
                              }
                              reviewError={
                                resolveReportMutation.isError &&
                                resolveReportMutation.variables?.reportId ===
                                  report.id
                                  ? getApiErrorMessage(
                                      resolveReportMutation.error,
                                    )
                                  : null
                              }
                              onReview={handleReviewReport}
                              onResolve={openResolveReportDialog}
                            />
                          ))}
                        </div>
                      )}
                    </section>
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      {rejectingItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRejectItemDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-reject-item-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-2xl sm:p-8"
          >
            <h2
              id="admin-reject-item-title"
              className="text-2xl font-extrabold text-[var(--trackit-navy)]"
            >
              Reject this item?
            </h2>

            <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
              Provide a clear reason for rejecting{" "}
              <span className="font-bold text-[var(--trackit-navy)]">
                “{rejectingItem.title}”
              </span>
              .
            </p>

            <textarea
              value={itemRejectionReason}
              onChange={(event) =>
                setItemRejectionReason(event.target.value)
              }
              maxLength={REJECTION_REASON_MAX_LENGTH}
              rows={6}
              autoFocus
              placeholder="Explain why this item cannot be approved."
              className="mt-5 w-full resize-y rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 py-3 text-sm leading-6 text-[var(--trackit-text)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/15"
            />

            <p className="mt-2 text-xs text-[var(--trackit-text-muted)]">
              {itemRejectionReason.length}/
              {REJECTION_REASON_MAX_LENGTH}
              {itemRejectionLength > 0 &&
              itemRejectionLength <
                REJECTION_REASON_MIN_LENGTH
                ? " · Use at least 3 characters."
                : ""}
            </p>

            {rejectItemMutation.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(
                  rejectItemMutation.error,
                )}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectItemDialog}
                disabled={rejectItemMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRejectItem}
                disabled={!canRejectItem}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-danger)] px-5 text-sm font-bold !text-white transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rejectItemMutation.isPending
                  ? "Rejecting..."
                  : "Reject item"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rejectingClaim ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRejectClaimDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-reject-claim-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-2xl sm:p-8"
          >
            <h2
              id="admin-reject-claim-title"
              className="text-2xl font-extrabold text-[var(--trackit-navy)]"
            >
              Reject this claim?
            </h2>

            <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
              Provide a clear reason for rejecting the claim
              for{" "}
              <span className="font-bold text-[var(--trackit-navy)]">
                “{rejectingClaim.item.title}”
              </span>
              .
            </p>

            <div className="mt-5 rounded-2xl bg-[var(--trackit-surface-blue)] px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-blue)]">
                Claimant
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--trackit-navy)]">
                @{rejectingClaim.claimant.username} · User #
                {rejectingClaim.claimant.id}
              </p>
            </div>

            <textarea
              value={claimRejectionReason}
              onChange={(event) =>
                setClaimRejectionReason(event.target.value)
              }
              maxLength={CLAIM_REJECTION_MAX_LENGTH}
              rows={6}
              autoFocus
              placeholder="Explain why this claim cannot be approved."
              className="mt-5 w-full resize-y rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 py-3 text-sm leading-6 text-[var(--trackit-text)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/15"
            />

            <p className="mt-2 text-xs text-[var(--trackit-text-muted)]">
              {claimRejectionReason.length}/
              {CLAIM_REJECTION_MAX_LENGTH}
              {claimRejectionLength > 0 &&
              claimRejectionLength <
                CLAIM_REJECTION_MIN_LENGTH
                ? " · Use at least 10 characters."
                : ""}
            </p>

            {rejectClaimMutation.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(
                  rejectClaimMutation.error,
                )}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectClaimDialog}
                disabled={rejectClaimMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRejectClaim}
                disabled={!canRejectClaim}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-danger)] px-5 text-sm font-bold !text-white transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rejectClaimMutation.isPending
                  ? "Rejecting..."
                  : "Reject claim"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {resolvingReport ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeResolveReportDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-resolve-report-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-2xl sm:p-8"
          >
            <h2
              id="admin-resolve-report-title"
              className="text-2xl font-extrabold text-[var(--trackit-navy)]"
            >
              Resolve this report?
            </h2>

            <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
              Add a concise resolution note explaining how
              the report was handled.
            </p>

            <textarea
              value={resolutionNote}
              onChange={(event) =>
                setResolutionNote(event.target.value)
              }
              maxLength={RESOLUTION_NOTE_MAX_LENGTH}
              rows={6}
              autoFocus
              placeholder="Describe the moderation outcome."
              className="mt-5 w-full resize-y rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 py-3 text-sm leading-6 text-[var(--trackit-text)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/15"
            />

            <p className="mt-2 text-xs text-[var(--trackit-text-muted)]">
              {resolutionNote.length}/
              {RESOLUTION_NOTE_MAX_LENGTH}
              {resolutionLength > 0 &&
              resolutionLength <
                RESOLUTION_NOTE_MIN_LENGTH
                ? " · Use at least 5 characters."
                : ""}
            </p>

            {resolveReportMutation.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(
                  resolveReportMutation.error,
                )}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeResolveReportDialog}
                disabled={resolveReportMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleResolveReport}
                disabled={!canResolveReport}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resolveReportMutation.isPending
                  ? "Resolving..."
                  : "Resolve report"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
