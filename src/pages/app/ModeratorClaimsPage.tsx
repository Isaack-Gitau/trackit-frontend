import { useState } from "react";
import { Link } from "react-router-dom";

import { getMediaUrl } from "../../api/config";
import { getApiErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import {
  useApproveClaim,
  usePendingClaims,
  useRejectClaim,
} from "../../hooks/useModeration";

import type { ModerationClaim } from "../../types/claim";

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

function ItemPlaceholderIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-12 w-12"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m21 15-4.5-4.5L7 20" />
    </svg>
  );
}

function ClaimSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)]">
      <div className="h-56 bg-[var(--trackit-blue-soft)]" />

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-[var(--trackit-blue-soft)]" />
          <div className="h-6 w-24 rounded-full bg-[var(--trackit-blue-soft)]" />
        </div>

        <div className="h-6 w-3/4 rounded bg-[var(--trackit-blue-soft)]" />

        <div className="h-4 w-1/2 rounded bg-[var(--trackit-blue-soft)]" />
        <div className="h-4 w-2/3 rounded bg-[var(--trackit-blue-soft)]" />

        <div className="h-24 rounded-2xl bg-[var(--trackit-blue-soft)]" />

        <div className="flex gap-3">
          <div className="h-11 flex-1 rounded-xl bg-[var(--trackit-blue-soft)]" />
          <div className="h-11 flex-1 rounded-xl bg-[var(--trackit-blue-soft)]" />
        </div>
      </div>
    </div>
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
  const isMutating = isApproving || isRejecting;

  return (
    <article className="group overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {imageUrl ? (
        <Link
          to={`/items/${claim.item.id}`}
          aria-label={`View ${claim.item.title}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <img
            src={imageUrl}
            alt={claim.item.title}
            className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.01]"
          />
        </Link>
      ) : (
        <Link
          to={`/items/${claim.item.id}`}
          aria-label={`View ${claim.item.title}`}
          className="flex h-56 items-center justify-center bg-[var(--trackit-surface-blue)] text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <ItemPlaceholderIcon />
        </Link>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.06em] text-amber-800">
            {claim.item.type}
          </span>

          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            Pending review
          </span>
        </div>

        <Link
          to={`/items/${claim.item.id}`}
          className="mt-4 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--trackit-navy)] transition-colors group-hover:text-[var(--trackit-blue)]">
            {claim.item.title}
          </h2>
        </Link>

        <dl className="mt-5 space-y-3 border-t border-[var(--trackit-border)] pt-5 text-sm">
          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-bold text-[var(--trackit-navy)]">
              Claimant
            </dt>

            <dd className="min-w-0 break-words text-[var(--trackit-text-muted)]">
              <span className="font-semibold text-[var(--trackit-navy)]">
                @{claim.claimant.username}
              </span>
              <span aria-hidden="true"> · </span>
              User #{claim.claimant.id}
            </dd>
          </div>

          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-bold text-[var(--trackit-navy)]">
              Category
            </dt>

            <dd className="min-w-0 break-words text-[var(--trackit-text-muted)]">
              {claim.item.category}
            </dd>
          </div>

          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-bold text-[var(--trackit-navy)]">
              Location
            </dt>

            <dd className="min-w-0 break-words text-[var(--trackit-text-muted)]">
              {claim.item.location}
            </dd>
          </div>

          <div className="flex gap-3">
            <dt className="w-24 shrink-0 font-bold text-[var(--trackit-navy)]">
              Submitted
            </dt>

            <dd className="min-w-0 text-[var(--trackit-text-muted)]">
              {formatDate(claim.created_at)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-2xl bg-[var(--trackit-surface-blue)] px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-blue)]">
            Claim reason
          </p>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--trackit-text-muted)]">
            {claim.reason}
          </p>
        </div>

        {approveError ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
          >
            <p className="font-bold">Could not approve this claim</p>
            <p className="mt-1">{approveError}</p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onApprove(claim)}
            disabled={isMutating}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isApproving ? (
              <>
                <span
                  aria-hidden="true"
                  className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
                Approving...
              </>
            ) : (
              "Approve claim"
            )}
          </button>

          <button
            type="button"
            onClick={() => onReject(claim)}
            disabled={isMutating}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-danger)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reject claim
          </button>
        </div>

        {isApproving ? (
          <p className="mt-3 text-center text-xs text-[var(--trackit-text-muted)]">
            Updating the claim and item status...
          </p>
        ) : null}

        {isRejecting ? (
          <p className="mt-3 text-center text-xs text-[var(--trackit-text-muted)]">
            Rejecting this claim...
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function ModeratorClaimsPage() {
  const { accessToken } = useAuth();

  const {
    data: claims = [],
    isLoading,
    isError,
    error,
    refetch,
  } = usePendingClaims(accessToken);

  const approveClaimMutation = useApproveClaim(accessToken);
  const rejectClaimMutation = useRejectClaim(accessToken);

  const [claimPendingRejection, setClaimPendingRejection] =
    useState<ModerationClaim | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  function openRejectDialog(claim: ModerationClaim) {
    approveClaimMutation.reset();
    rejectClaimMutation.reset();
    setRejectionReason("");
    setClaimPendingRejection(claim);
  }

  function closeRejectDialog() {
    if (rejectClaimMutation.isPending) {
      return;
    }

    rejectClaimMutation.reset();
    setRejectionReason("");
    setClaimPendingRejection(null);
  }

  function handleApprove(claim: ModerationClaim) {
    approveClaimMutation.reset();
    rejectClaimMutation.reset();

    approveClaimMutation.mutate({
      claimId: claim.id,
    });
  }

  function handleReject() {
    if (!claimPendingRejection) {
      return;
    }

    const trimmedReason = rejectionReason.trim();

    if (trimmedReason.length < 10 || trimmedReason.length > 2000) {
      return;
    }

    rejectClaimMutation.mutate(
      {
        claimId: claimPendingRejection.id,
        payload: {
          rejection_reason: trimmedReason,
        },
      },
      {
        onSuccess: () => {
          setClaimPendingRejection(null);
          setRejectionReason("");
          rejectClaimMutation.reset();
        },
      },
    );
  }

  const trimmedRejectionReason = rejectionReason.trim();
  const rejectionReasonTooShort =
    trimmedRejectionReason.length > 0 &&
    trimmedRejectionReason.length < 10;
  const rejectionReasonTooLong =
    trimmedRejectionReason.length > 2000;
  const canReject =
    trimmedRejectionReason.length >= 10 &&
    trimmedRejectionReason.length <= 2000 &&
    !rejectClaimMutation.isPending;

  return (
    <>
      <main className="min-h-[70vh] bg-[var(--trackit-surface)] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-7xl">
          <section>
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
                Moderation
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl lg:text-5xl">
                Claim review
              </h1>

              <p className="mt-4 text-base leading-7 text-[var(--trackit-text-muted)] sm:text-lg">
                Review submitted claims against found items and decide
                whether each claim should be approved or rejected.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="pending-claims-heading"
            className="mt-12"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Review queue
                </p>

                <h2
                  id="pending-claims-heading"
                  className="mt-2 text-3xl font-extrabold text-[var(--trackit-navy)]"
                >
                  Pending claims
                </h2>
              </div>

              {!isLoading && !isError ? (
                <p className="text-sm text-[var(--trackit-text-muted)]">
                  {claims.length}{" "}
                  {claims.length === 1 ? "claim" : "claims"} awaiting
                  review
                </p>
              ) : null}
            </div>

            {isLoading ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ClaimSkeleton key={index} />
                ))}
              </div>
            ) : isError ? (
              <div
                role="alert"
                className="mt-7 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center"
              >
                <h3 className="text-lg font-bold text-red-900">
                  We couldn't load the pending claims
                </h3>

                <p className="mt-2 text-sm leading-7 text-red-800">
                  {getApiErrorMessage(error)}
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-5 min-h-11 rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Try again
                </button>
              </div>
            ) : claims.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-14 text-center">
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
                  No claims are waiting for review
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[var(--trackit-text-muted)]">
                  New claims submitted against found items will
                  appear here when they require moderation.
                </p>
              </div>
            ) : (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {claims.map((claim) => (
                  <ClaimCard
                    key={claim.id}
                    claim={claim}
                    isApproving={
                      approveClaimMutation.isPending &&
                      approveClaimMutation.variables?.claimId === claim.id
                    }
                    isRejecting={
                      rejectClaimMutation.isPending &&
                      rejectClaimMutation.variables?.claimId === claim.id
                    }
                    approveError={
                      approveClaimMutation.isError &&
                      approveClaimMutation.variables?.claimId === claim.id
                        ? getApiErrorMessage(approveClaimMutation.error)
                        : null
                    }
                    onApprove={handleApprove}
                    onReject={openRejectDialog}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {claimPendingRejection ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRejectDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-claim-dialog-title"
            aria-describedby="reject-claim-dialog-description"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--trackit-danger-soft)] text-[var(--trackit-danger)]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.3 3.6 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
              </svg>
            </div>

            <h2
              id="reject-claim-dialog-title"
              className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--trackit-navy)]"
            >
              Reject this claim?
            </h2>

            <p
              id="reject-claim-dialog-description"
              className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]"
            >
              Provide a clear reason for rejecting the claim for{" "}
              <span className="font-bold text-[var(--trackit-navy)]">
                “{claimPendingRejection.item.title}”
              </span>
              .
            </p>

            <div className="mt-5 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-blue)]">
                Claimant
              </p>

              <p className="mt-2 text-sm font-semibold text-[var(--trackit-navy)]">
                @{claimPendingRejection.claimant.username}
                <span aria-hidden="true"> · </span>
                User #{claimPendingRejection.claimant.id}
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="claim-rejection-reason"
                className="block text-sm font-bold text-[var(--trackit-navy)]"
              >
                Rejection reason
              </label>

              <textarea
                id="claim-rejection-reason"
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(event.target.value)
                }
                maxLength={2000}
                rows={6}
                autoFocus
                placeholder="Explain why this claim cannot be approved."
                className="mt-2 w-full resize-y rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 py-3 text-sm leading-6 text-[var(--trackit-text)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/15"
              />

              <div className="mt-2 flex items-start justify-between gap-4 text-xs">
                <p
                  className={
                    rejectionReasonTooShort || rejectionReasonTooLong
                      ? "text-red-700"
                      : "text-[var(--trackit-text-muted)]"
                  }
                >
                  {rejectionReasonTooShort
                    ? "Use at least 10 characters."
                    : rejectionReasonTooLong
                      ? "Use no more than 2000 characters."
                      : "A clear explanation helps keep moderation decisions understandable."}
                </p>

                <span className="shrink-0 text-[var(--trackit-text-muted)]">
                  {rejectionReason.length}/2000
                </span>
              </div>
            </div>

            {rejectClaimMutation.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(rejectClaimMutation.error)}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectDialog}
                disabled={rejectClaimMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={!canReject}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-danger)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rejectClaimMutation.isPending ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Rejecting...
                  </>
                ) : (
                  "Reject claim"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}