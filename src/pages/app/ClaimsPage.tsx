import { useState } from "react";
import { Link } from "react-router-dom";

import { getMediaUrl } from "../../api/config";
import { getApiErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import { useMyClaims } from "../../hooks/useMyClaims";
import { useWithdrawClaim } from "../../hooks/useClaimMutations";

import type {
  Claim,
  ClaimStatus,
} from "../../types/claim";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function getStatusLabel(status: ClaimStatus): string {
  switch (status) {
    case "pending":
      return "Pending review";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "withdrawn":
      return "Withdrawn";
    default:
      return status;
  }
}

function getStatusClasses(status: ClaimStatus): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "withdrawn":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-[var(--trackit-surface-blue)] text-[var(--trackit-navy)]";
  }
}

function getTypeClasses(type: "lost" | "found"): string {
  return type === "lost"
    ? "bg-amber-100 text-amber-800"
    : "bg-emerald-100 text-emerald-800";
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
      <div className="h-52 bg-[var(--trackit-blue-soft)]" />

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-[var(--trackit-blue-soft)]" />
          <div className="h-6 w-24 rounded-full bg-[var(--trackit-blue-soft)]" />
        </div>

        <div className="h-6 w-3/4 rounded bg-[var(--trackit-blue-soft)]" />

        <div className="h-4 w-2/3 rounded bg-[var(--trackit-blue-soft)]" />
        <div className="h-4 w-4/5 rounded bg-[var(--trackit-blue-soft)]" />

        <div className="border-t border-[var(--trackit-border)] pt-4">
          <div className="h-4 w-1/2 rounded bg-[var(--trackit-blue-soft)]" />
          <div className="mt-3 h-4 w-2/3 rounded bg-[var(--trackit-blue-soft)]" />
        </div>
      </div>
    </div>
  );
}

function ClaimCard({
  claim,
  onWithdraw,
}: {
  claim: Claim;
  onWithdraw: (claim: Claim) => void;
}) {
  const imageUrl = getMediaUrl(claim.item.image);

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
            className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.01]"
          />
        </Link>
      ) : (
        <Link
          to={`/items/${claim.item.id}`}
          aria-label={`View ${claim.item.title}`}
          className="flex h-52 items-center justify-center bg-[var(--trackit-surface-blue)] text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <ItemPlaceholderIcon />
        </Link>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.06em]",
              getTypeClasses(claim.item.type),
            ].join(" ")}
          >
            {claim.item.type}
          </span>

          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-bold",
              getStatusClasses(claim.status),
            ].join(" ")}
          >
            {getStatusLabel(claim.status)}
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
            <dt className="w-20 shrink-0 font-bold text-[var(--trackit-navy)]">
              Category
            </dt>

            <dd className="min-w-0 break-words text-[var(--trackit-text-muted)]">
              {claim.item.category}
            </dd>
          </div>

          <div className="flex gap-3">
            <dt className="w-20 shrink-0 font-bold text-[var(--trackit-navy)]">
              Location
            </dt>

            <dd className="min-w-0 break-words text-[var(--trackit-text-muted)]">
              {claim.item.location}
            </dd>
          </div>

          <div className="flex gap-3">
            <dt className="w-20 shrink-0 font-bold text-[var(--trackit-navy)]">
              Claimed
            </dt>

            <dd className="min-w-0 text-[var(--trackit-text-muted)]">
              {formatDate(claim.created_at)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 rounded-2xl bg-[var(--trackit-surface-blue)] px-4 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-blue)]">
            Your claim
          </p>

          <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
            {claim.reason}
          </p>
        </div>

        {claim.status === "pending" ? (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/items/${claim.item.id}`}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              View post
            </Link>

            <button
              type="button"
              onClick={() => onWithdraw(claim)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-5 text-sm font-bold text-[var(--trackit-danger-text)] transition hover:border-[var(--trackit-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30"
            >
              Withdraw claim
            </button>
          </div>
        ) : (
          <Link
            to={`/items/${claim.item.id}`}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
          >
            View post
          </Link>
        )}

        {claim.status === "approved" ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <p className="text-sm font-bold text-emerald-900">
              Your claim was approved.
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-800">
              TrackIt has approved your claim for this item.
            </p>
          </div>
        ) : null}

        {claim.status === "rejected" ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
            <p className="text-sm font-bold text-red-900">
              Your claim was rejected.
            </p>

            {claim.rejection_reason ? (
              <p className="mt-1 text-sm leading-6 text-red-800">
                {claim.rejection_reason}
              </p>
            ) : (
              <p className="mt-1 text-sm leading-6 text-red-800">
                No rejection reason was provided.
              </p>
            )}
          </div>
        ) : null}

        {claim.status === "withdrawn" ? (
          <div className="mt-4 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-4 py-4">
            <p className="text-sm font-bold text-[var(--trackit-navy)]">
              This claim has been withdrawn.
            </p>

            <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-muted)]">
              You withdrew your claim and it is no longer under review.
            </p>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function ClaimsPage() {
  const { accessToken } = useAuth();

  const {
    data: claims = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useMyClaims(accessToken);

  const withdrawClaimMutation = useWithdrawClaim(accessToken);

  const [claimPendingWithdrawal, setClaimPendingWithdrawal] =
    useState<Claim | null>(null);

  function openWithdrawConfirmation(claim: Claim) {
    if (claim.status !== "pending") {
      return;
    }

    withdrawClaimMutation.reset();
    setClaimPendingWithdrawal(claim);
  }

  function closeWithdrawConfirmation() {
    if (withdrawClaimMutation.isPending) {
      return;
    }

    withdrawClaimMutation.reset();
    setClaimPendingWithdrawal(null);
  }

  function handleWithdraw() {
    if (!claimPendingWithdrawal) {
      return;
    }

    withdrawClaimMutation.mutate(
      {
        claimId: claimPendingWithdrawal.id,
      },
      {
        onSuccess: () => {
          setClaimPendingWithdrawal(null);
          withdrawClaimMutation.reset();
        },
      },
    );
  }

  return (
    <>
      <main className="min-h-[70vh] bg-[var(--trackit-surface)] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-7xl">
          <section>
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
                Your claims
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl lg:text-5xl">
                Claims
              </h1>

              <p className="mt-4 text-base leading-7 text-[var(--trackit-text-muted)] sm:text-lg">
                Review the claims you have submitted, follow their
                status, and keep track of the items you are trying to
                recover.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="claims-results-heading"
            className="mt-12"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Activity
                </p>

                <h2
                  id="claims-results-heading"
                  className="mt-2 text-3xl font-extrabold text-[var(--trackit-navy)]"
                >
                  Your submitted claims
                </h2>
              </div>

              {!isLoading && !isError ? (
                <p className="text-sm text-[var(--trackit-text-muted)]">
                  {claims.length}{" "}
                  {claims.length === 1 ? "claim" : "claims"}
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
                  We couldn't load your claims
                </h3>

                <p className="mt-2 text-sm leading-7 text-red-800">
                  {getApiErrorMessage(error)}
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  className="mt-5 min-h-11 rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Try again
                </button>
              </div>
            ) : claims.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]">
                  <ItemPlaceholderIcon />
                </div>

                <h3 className="mt-6 text-xl font-extrabold text-[var(--trackit-navy)]">
                  You haven't submitted any claims yet
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[var(--trackit-text-muted)]">
                  When you find a lost or found post that you believe
                  belongs to you, you can submit a claim from its item
                  page.
                </p>

                <Link
                  to="/discover"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Discover posts
                </Link>
              </div>
            ) : (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {claims.map((claim) => (
                  <ClaimCard
                    key={claim.id}
                    claim={claim}
                    onWithdraw={openWithdrawConfirmation}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {claimPendingWithdrawal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeWithdrawConfirmation();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdraw-claim-dialog-title"
            aria-describedby="withdraw-claim-dialog-description"
            className="w-full max-w-lg rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-2xl sm:p-8"
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
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </div>

            <h2
              id="withdraw-claim-dialog-title"
              className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--trackit-navy)]"
            >
              Withdraw this claim?
            </h2>

            <p
              id="withdraw-claim-dialog-description"
              className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]"
            >
              You are about to withdraw your claim for{" "}
              <span className="font-bold text-[var(--trackit-navy)]">
                “{claimPendingWithdrawal.item.title}”
              </span>
              .
            </p>

            <div className="mt-5 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-4 py-4">
              <p className="text-sm leading-6 text-[var(--trackit-text-muted)]">
                The claim will no longer be under review. You can
                still view the item post afterward.
              </p>
            </div>

            {withdrawClaimMutation.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(withdrawClaimMutation.error)}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeWithdrawConfirmation}
                disabled={withdrawClaimMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawClaimMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-danger)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {withdrawClaimMutation.isPending ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Withdrawing...
                  </>
                ) : (
                  "Withdraw claim"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
