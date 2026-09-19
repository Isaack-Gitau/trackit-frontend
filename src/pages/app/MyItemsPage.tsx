import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import { useDeleteItem } from "../../hooks/useItemMutations";
import { useMyClaims } from "../../hooks/useMyClaims";
import { useMyItems } from "../../hooks/useMyItems";

import type {
  Item,
  ItemStatus,
  ItemType,
} from "../../types/item";

type ItemFilter = "all" | ItemType;
type StatusFilter = "all" | ItemStatus;

function getImageUrl(image: string | null): string | null {
  if (!image) {
    return null;
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return image.startsWith("/") ? image : `/${image}`;
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
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

function TrashIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function ItemCard({
  item,
  hasClaim,
  onDelete,
}: {
  item: Item;
  hasClaim: boolean;
  onDelete: (item: Item) => void;
}) {
  const imageUrl = getImageUrl(item.image);
  const canDelete = item.status !== "claimed";

  return (
    <article className="group overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {imageUrl ? (
        <Link
          to={`/items/${item.id}`}
          aria-label={`View ${item.title}`}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <img
            src={imageUrl}
            alt={item.title}
            className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.01]"
          />
        </Link>
      ) : (
        <Link
          to={`/items/${item.id}`}
          aria-label={`View ${item.title}`}
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

          {hasClaim ? (
            <span className="rounded-full border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3 py-1 text-xs font-bold text-[var(--trackit-navy)]">
              Claim activity
            </span>
          ) : null}
        </div>

        <Link
          to={`/items/${item.id}`}
          className="mt-4 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--trackit-navy)] transition-colors group-hover:text-[var(--trackit-blue)]">
            {item.title}
          </h2>
        </Link>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
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

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/items/${item.id}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
          >
            View post
            <span className="ml-2" aria-hidden="true">
              →
            </span>
          </Link>

          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-5 text-sm font-bold text-[var(--trackit-danger-text)] transition hover:border-[var(--trackit-danger)] hover:bg-[var(--trackit-danger-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30"
            >
              <TrashIcon />
              Delete post
            </button>
          ) : (
            <div className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-5 text-center text-xs font-bold text-[var(--trackit-text-muted)]">
              Claimed posts cannot be deleted
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ItemSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)]">
      <div className="h-52 bg-[var(--trackit-blue-soft)]" />

      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex gap-2">
          <div className="h-6 w-16 rounded-full bg-[var(--trackit-blue-soft)]" />
          <div className="h-6 w-24 rounded-full bg-[var(--trackit-blue-soft)]" />
        </div>

        <div className="h-6 w-3/4 rounded bg-[var(--trackit-blue-soft)]" />

        <div className="h-4 w-full rounded bg-[var(--trackit-blue-soft)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--trackit-blue-soft)]" />

        <div className="border-t border-[var(--trackit-border)] pt-4">
          <div className="h-4 w-2/3 rounded bg-[var(--trackit-blue-soft)]" />
          <div className="mt-3 h-4 w-4/5 rounded bg-[var(--trackit-blue-soft)]" />
        </div>
      </div>
    </div>
  );
}

export function MyItemsPage() {
  const { accessToken } = useAuth();

  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useMyItems(accessToken);

  const {
    data: claims = [],
    isLoading: areClaimsLoading,
  } = useMyClaims(accessToken);

  const [typeFilter, setTypeFilter] =
    useState<ItemFilter>("all");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [itemPendingDeletion, setItemPendingDeletion] =
    useState<Item | null>(null);

  const deleteItemMutation = useDeleteItem(accessToken);

  const claimItemIds = useMemo(
    () => new Set(claims.map((claim) => claim.item_id)),
    [claims],
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType =
        typeFilter === "all" ||
        item.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        item.status === statusFilter;

      return matchesType && matchesStatus;
    });
  }, [items, statusFilter, typeFilter]);

  const activeFilterCount =
    (typeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0);

  function clearFilters() {
    setTypeFilter("all");
    setStatusFilter("all");
  }

  function openDeleteConfirmation(item: Item) {
    if (item.status === "claimed") {
      return;
    }

    deleteItemMutation.reset();
    setItemPendingDeletion(item);
  }

  function closeDeleteConfirmation() {
    if (deleteItemMutation.isPending) {
      return;
    }

    deleteItemMutation.reset();
    setItemPendingDeletion(null);
  }

  function handleDelete() {
    if (!itemPendingDeletion) {
      return;
    }

    deleteItemMutation.mutate(
      {
        itemId: itemPendingDeletion.id,
      },
      {
        onSuccess: () => {
          setItemPendingDeletion(null);
          deleteItemMutation.reset();
        },
      },
    );
  }

  return (
    <>
      <main className="min-h-[70vh] bg-[var(--trackit-surface)] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-7xl">
          <section>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
                  Your posts
                </p>

                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl lg:text-5xl">
                  My items
                </h1>

                <p className="mt-4 text-base leading-7 text-[var(--trackit-text-muted)] sm:text-lg">
                  Keep track of the lost and found posts you have
                  submitted, their review status, and any claim activity
                  connected to them.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <Link
                  to="/items/post-lost"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Post lost item
                </Link>

                <Link
                  to="/items/post-found"
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-button-secondary-bg)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-button-secondary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Post found item
                </Link>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="my-items-filters-heading"
            className="mt-10 rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm sm:p-7"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Filter posts
                </p>

                <h2
                  id="my-items-filters-heading"
                  className="mt-2 text-2xl font-extrabold text-[var(--trackit-navy)]"
                >
                  Review your activity
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

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="my-items-type"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Post type
                </label>

                <select
                  id="my-items-type"
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(
                      event.target.value as ItemFilter,
                    )
                  }
                  className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-input-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                >
                  <option value="all">All posts</option>
                  <option value="lost">Lost items</option>
                  <option value="found">Found items</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="my-items-status"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Status
                </label>

                <select
                  id="my-items-status"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as StatusFilter,
                    )
                  }
                  className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-input-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="claimed">Claimed</option>
                </select>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="my-items-results-heading"
            className="mt-12"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Posts
                </p>

                <h2
                  id="my-items-results-heading"
                  className="mt-2 text-3xl font-extrabold text-[var(--trackit-navy)]"
                >
                  Your item posts
                </h2>
              </div>

              {!isLoading && !isError ? (
                <p className="text-sm text-[var(--trackit-text-muted)]">
                  {filteredItems.length}{" "}
                  {filteredItems.length === 1
                    ? "post"
                    : "posts"}
                </p>
              ) : null}
            </div>

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
                  We couldn't load your posts
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
            ) : items.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]">
                  <ItemPlaceholderIcon />
                </div>

                <h3 className="mt-6 text-xl font-extrabold text-[var(--trackit-navy)]">
                  You haven't posted any items yet
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[var(--trackit-text-muted)]">
                  Start by posting something you lost or an item you
                  found so TrackIt can help connect the right people.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    to="/items/post-lost"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    Post lost item
                  </Link>

                  <Link
                    to="/items/post-found"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-button-secondary-bg)] px-5 text-sm font-bold !text-white hover:bg-[var(--trackit-button-secondary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    Post found item
                  </Link>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-12 text-center">
                <h3 className="text-lg font-bold text-[var(--trackit-navy)]">
                  No posts match these filters
                </h3>

                <p className="mt-2 text-sm leading-7 text-[var(--trackit-text-muted)]">
                  Try changing the post type or status filter.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 min-h-11 rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    hasClaim={claimItemIds.has(item.id)}
                    onDelete={openDeleteConfirmation}
                  />
                ))}
              </div>
            )}

            {areClaimsLoading ? (
              <p className="mt-6 text-xs text-[var(--trackit-text-muted)]">
                Checking claim activity...
              </p>
            ) : null}
          </section>
        </div>
      </main>

      {itemPendingDeletion ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteConfirmation();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-item-dialog-title"
            aria-describedby="delete-item-dialog-description"
            className="w-full max-w-lg rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-2xl sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--trackit-danger-soft)] text-[var(--trackit-danger)]">
              <TrashIcon />
            </div>

            <h2
              id="delete-item-dialog-title"
              className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--trackit-navy)]"
            >
              Delete this post?
            </h2>

            <p
              id="delete-item-dialog-description"
              className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]"
            >
              You are about to permanently delete{" "}
              <span className="font-bold text-[var(--trackit-navy)]">
                “{itemPendingDeletion.title}”
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-5 rounded-2xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-4 py-4">
              <p className="text-sm leading-6 text-[var(--trackit-danger-text)]">
                Any associated claim, match, comment, or post
                activity that is tied to this item may also be removed.
                Claimed items cannot be deleted.
              </p>
            </div>

            {deleteItemMutation.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(deleteItemMutation.error)}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteConfirmation}
                disabled={deleteItemMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteItemMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-danger)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteItemMutation.isPending ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete post"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
