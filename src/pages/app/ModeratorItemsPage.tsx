import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getMediaUrl } from "../../api/config";
import { getApiErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import {
  useApproveItem,
  useModerationItems,
  useRejectItem,
} from "../../hooks/useModeration";

import type {
  Item,
  ItemStatus,
  ItemType,
} from "../../types/item";

type StatusFilter = "all" | ItemStatus;
type TypeFilter = "all" | ItemType;

const REJECTION_REASON_MIN_LENGTH = 3;
const REJECTION_REASON_MAX_LENGTH = 2000;

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

function getStatusLabel(status: ItemStatus): string {
  switch (status) {
    case "pending":
      return "Pending review";
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

function getStatusClasses(status: ItemStatus): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "approved":
      return "bg-emerald-100 text-emerald-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "claimed":
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]";
    default:
      return "bg-[var(--trackit-surface-blue)] text-[var(--trackit-navy)]";
  }
}

function getTypeClasses(type: ItemType): string {
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

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function RejectIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function ItemSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)]">
      <div className="h-56 bg-[var(--trackit-blue-soft)]" />

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-[var(--trackit-blue-soft)]" />
          <div className="h-6 w-24 rounded-full bg-[var(--trackit-blue-soft)]" />
        </div>

        <div className="h-7 w-3/4 rounded bg-[var(--trackit-blue-soft)]" />

        <div className="h-4 w-full rounded bg-[var(--trackit-blue-soft)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--trackit-blue-soft)]" />

        <div className="border-t border-[var(--trackit-border)] pt-4">
          <div className="h-4 w-2/3 rounded bg-[var(--trackit-blue-soft)]" />
          <div className="mt-3 h-4 w-4/5 rounded bg-[var(--trackit-blue-soft)]" />
        </div>

        <div className="h-11 rounded-xl bg-[var(--trackit-blue-soft)]" />
      </div>
    </div>
  );
}

function ItemCard({
  item,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  item: Item;
  onApprove: (item: Item) => void;
  onReject: (item: Item) => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const imageUrl = getMediaUrl(item.image);
  const isPending = item.status === "pending";
  const isBusy = isApproving || isRejecting;

  return (
    <article className="overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {imageUrl ? (
        <Link
          to={`/items/${item.id}`}
          aria-label={`View ${item.title}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <img
            src={imageUrl}
            alt={item.title}
            className="h-56 w-full object-cover"
          />
        </Link>
      ) : (
        <Link
          to={`/items/${item.id}`}
          aria-label={`View ${item.title}`}
          className="flex h-56 items-center justify-center bg-[var(--trackit-surface-blue)] text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <ItemPlaceholderIcon />
        </Link>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.06em]",
              getTypeClasses(item.type),
            ].join(" ")}
          >
            {item.type}
          </span>

          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-bold",
              getStatusClasses(item.status),
            ].join(" ")}
          >
            {getStatusLabel(item.status)}
          </span>
        </div>

        <Link
          to={`/items/${item.id}`}
          className="mt-4 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--trackit-navy)]">
            {item.title}
          </h2>
        </Link>

        <p className="mt-2 line-clamp-4 text-sm leading-6 text-[var(--trackit-text-muted)]">
          {item.description}
        </p>

        <dl className="mt-5 space-y-3 border-t border-[var(--trackit-border)] pt-5 text-sm">
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 font-bold text-[var(--trackit-navy)]">
              Category
            </dt>

            <dd className="min-w-0 break-words text-[var(--trackit-text-muted)]">
              {item.category}
            </dd>
          </div>

          <div className="flex gap-3">
            <dt className="w-20 shrink-0 font-bold text-[var(--trackit-navy)]">
              Location
            </dt>

            <dd className="min-w-0 break-words text-[var(--trackit-text-muted)]">
              {item.location}
            </dd>
          </div>

          <div className="flex gap-3">
            <dt className="w-20 shrink-0 font-bold text-[var(--trackit-navy)]">
              Posted
            </dt>

            <dd className="min-w-0 text-[var(--trackit-text-muted)]">
              {formatDate(item.created_at)}
            </dd>
          </div>
        </dl>

        {isPending ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onApprove(item)}
              disabled={isBusy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isApproving ? (
                <>
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                  />
                  Approving...
                </>
              ) : (
                <>
                  <CheckIcon />
                  Approve
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onReject(item)}
              disabled={isBusy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-4 text-sm font-bold text-[var(--trackit-danger-text)] transition hover:border-[var(--trackit-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RejectIcon />
              Reject
            </button>
          </div>
        ) : (
          <Link
            to={`/items/${item.id}`}
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
          >
            View post
          </Link>
        )}
      </div>
    </article>
  );
}

export function ModeratorItemsPage() {
  const { accessToken } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("pending");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [rejectingItem, setRejectingItem] =
    useState<Item | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const filters = {
    search: search || undefined,
    type: typeFilter === "all" ? undefined : typeFilter,
    status: statusFilter === "all" ? undefined : statusFilter,
    category: category.trim() || undefined,
    location: location.trim() || undefined,
    page: 1,
    limit: 20,
  };

  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useModerationItems(filters, accessToken);

  const approveItemMutation = useApproveItem(accessToken);
  const rejectItemMutation = useRejectItem(accessToken);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("pending");
    setCategory("");
    setLocation("");
  }

  function openRejectDialog(item: Item) {
    approveItemMutation.reset();
    rejectItemMutation.reset();
    setRejectionReason("");
    setRejectingItem(item);
  }

  function closeRejectDialog() {
    if (rejectItemMutation.isPending) {
      return;
    }

    rejectItemMutation.reset();
    setRejectingItem(null);
    setRejectionReason("");
  }

  function handleApprove(item: Item) {
    approveItemMutation.reset();

    approveItemMutation.mutate({
      itemId: item.id,
    });
  }

  function handleReject() {
    if (!rejectingItem) {
      return;
    }

    const reason = rejectionReason.trim();

    if (
      reason.length < REJECTION_REASON_MIN_LENGTH ||
      reason.length > REJECTION_REASON_MAX_LENGTH
    ) {
      return;
    }

    rejectItemMutation.mutate(
      {
        itemId: rejectingItem.id,
        payload: {
          reason,
        },
      },
      {
        onSuccess: () => {
          setRejectingItem(null);
          setRejectionReason("");
          rejectItemMutation.reset();
        },
      },
    );
  }

  const activeFilterCount =
    (search ? 1 : 0) +
    (typeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (category.trim() ? 1 : 0) +
    (location.trim() ? 1 : 0);

  const rejectionReasonLength = rejectionReason.trim().length;
  const canSubmitRejection =
    rejectionReasonLength >= REJECTION_REASON_MIN_LENGTH &&
    rejectionReasonLength <= REJECTION_REASON_MAX_LENGTH;

  const mutationError =
    approveItemMutation.isError
      ? approveItemMutation.error
      : rejectItemMutation.isError
        ? rejectItemMutation.error
        : null;

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
                Item moderation
              </h1>

              <p className="mt-4 text-base leading-7 text-[var(--trackit-text-muted)] sm:text-lg">
                Review submitted lost and found posts, inspect the
                available item information, and approve or reject posts
                according to TrackIt's moderation rules.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="moderation-item-filters-heading"
            className="mt-10 rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm sm:p-7"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Review queue
                </p>

                <h2
                  id="moderation-item-filters-heading"
                  className="mt-2 text-2xl font-extrabold text-[var(--trackit-navy)]"
                >
                  Find submissions
                </h2>
              </div>

              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="self-start rounded-lg px-3 py-2 text-sm font-bold !text-[var(--trackit-blue)] transition hover:bg-[var(--trackit-blue-soft)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] sm:self-auto"
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div>
                <label
                  htmlFor="moderation-search"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Search
                </label>

                <input
                  id="moderation-search"
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
                  htmlFor="moderation-status"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Status
                </label>

                <select
                  id="moderation-status"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as StatusFilter,
                    )
                  }
                  className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-input-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                >
                  <option value="pending">Pending review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="claimed">Claimed</option>
                  <option value="all">All statuses</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="moderation-type"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Post type
                </label>

                <select
                  id="moderation-type"
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
                  htmlFor="moderation-category"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Category
                </label>

                <input
                  id="moderation-category"
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
                  htmlFor="moderation-location"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Location
                </label>

                <input
                  id="moderation-location"
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
          </section>

          <section
            aria-labelledby="moderation-items-results-heading"
            className="mt-12"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Submissions
                </p>

                <h2
                  id="moderation-items-results-heading"
                  className="mt-2 text-3xl font-extrabold text-[var(--trackit-navy)]"
                >
                  Items for review
                </h2>
              </div>

              {!isLoading && !isError ? (
                <p className="text-sm text-[var(--trackit-text-muted)]">
                  {items.length}{" "}
                  {items.length === 1
                    ? "submission"
                    : "submissions"}
                </p>
              ) : null}
            </div>

            {mutationError ? (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(mutationError)}
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ItemSkeleton key={index} />
                ))}
              </div>
            ) : isError ? (
              <div
                role="alert"
                className="mt-7 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center"
              >
                <h3 className="text-lg font-bold text-red-900">
                  We couldn't load moderation items
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
            ) : items.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]">
                  <ItemPlaceholderIcon />
                </div>

                <h3 className="mt-6 text-xl font-extrabold text-[var(--trackit-navy)]">
                  No submissions found
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[var(--trackit-text-muted)]">
                  There are no items matching the current moderation
                  filters.
                </p>

                {activeFilterCount > 0 ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 min-h-11 rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onReject={openRejectDialog}
                    isApproving={
                      approveItemMutation.isPending &&
                      approveItemMutation.variables?.itemId === item.id
                    }
                    isRejecting={
                      rejectItemMutation.isPending &&
                      rejectItemMutation.variables?.itemId === item.id
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {rejectingItem ? (
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
            aria-labelledby="reject-item-dialog-title"
            aria-describedby="reject-item-dialog-description"
            className="w-full max-w-lg rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--trackit-danger-soft)] text-[var(--trackit-danger)]">
              <RejectIcon />
            </div>

            <h2
              id="reject-item-dialog-title"
              className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--trackit-navy)]"
            >
              Reject this submission?
            </h2>

            <p
              id="reject-item-dialog-description"
              className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]"
            >
              Provide a clear reason for rejecting{" "}
              <span className="font-bold text-[var(--trackit-navy)]">
                “{rejectingItem.title}”
              </span>
              .
            </p>

            <div className="mt-5">
              <label
                htmlFor="rejection-reason"
                className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
              >
                Rejection reason
              </label>

              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(event.target.value)
                }
                maxLength={REJECTION_REASON_MAX_LENGTH}
                rows={5}
                placeholder="Explain why this submission cannot be approved."
                className="w-full resize-y rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-input-surface)] px-4 py-3 text-sm leading-6 text-[var(--trackit-navy)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                disabled={rejectItemMutation.isPending}
              />

              <div className="mt-2 flex justify-between gap-4 text-xs text-[var(--trackit-text-muted)]">
                <span>
                  Minimum {REJECTION_REASON_MIN_LENGTH} characters.
                  Maximum {REJECTION_REASON_MAX_LENGTH}.
                </span>

                <span>
                  {rejectionReasonLength}/
                  {REJECTION_REASON_MAX_LENGTH}
                </span>
              </div>
            </div>

            {rejectItemMutation.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(rejectItemMutation.error)}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectDialog}
                disabled={rejectItemMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={
                  !canSubmitRejection ||
                  rejectItemMutation.isPending
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--trackit-danger)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rejectItemMutation.isPending ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <RejectIcon />
                    Reject submission
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}