import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { getMediaUrl } from "../../api/config";
import { usePublicItems } from "../../hooks/usePublicItems";

import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

import type {
  Item,
  ItemType,
} from "../../types/item";

const PAGE_SIZE = 12;

const ITEM_TYPES: Array<{
  value: ItemType | "";
  label: string;
}> = [
  { value: "", label: "All items" },
  { value: "lost", label: "Lost items" },
  { value: "found", label: "Found items" },
];

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently posted";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getTypeLabel(type: ItemType): string {
  return type === "lost" ? "Lost" : "Found";
}

function getTypeBadgeClasses(type: ItemType): string {
  return type === "lost"
    ? "bg-[var(--trackit-warning-soft)] text-[var(--trackit-warning)]"
    : "bg-[var(--trackit-success-soft)] text-[var(--trackit-success)]";
}

function getStatusLabel(item: Item): string | null {
  if (item.type !== "found") {
    return null;
  }

  if (item.status === "claimed") {
    return "Claimed";
  }

  if (item.status === "approved") {
    return "Available";
  }

  return null;
}

function getStatusClasses(item: Item): string {
  if (item.status === "claimed") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]";
}

function getItemSummary(item: Item): string {
  const description = item.description.trim();

  if (description.length <= 150) {
    return description;
  }

  return `${description.slice(0, 147).trimEnd()}...`;
}

function DiscoverItemSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />

      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>

        <Skeleton className="h-6 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-12 w-full rounded" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </article>
  );
}

function AuthenticatedDiscoverSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <DiscoverItemSkeleton key={index} />
      ))}
    </div>
  );
}

function ItemImage({
  item,
}: {
  item: Item;
}) {
  const imageUrl = getMediaUrl(item.image);

  if (!imageUrl) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-[var(--trackit-blue-soft)] px-6 text-center">
        <div>
          <p className="text-sm font-bold text-[var(--trackit-navy)]">
            No image available
          </p>

          <p className="mt-1 text-xs leading-5 text-[var(--trackit-text-muted)]">
            View the item for its full details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] overflow-hidden bg-[var(--trackit-blue-soft)]">
      <img
        src={imageUrl}
        alt={item.title}
        loading="lazy"
        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      />
    </div>
  );
}

function DiscoverItemCard({
  item,
}: {
  item: Item;
}) {
  const statusLabel = getStatusLabel(item);

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        to={`/items/${item.id}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-inset"
        aria-label={`View ${item.title}`}
      >
        <ItemImage item={item} />
      </Link>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full px-2.5 py-1",
                "text-xs font-bold",
                getTypeBadgeClasses(item.type),
              ].join(" ")}
            >
              {getTypeLabel(item.type)}
            </span>

            {statusLabel ? (
              <span
                className={[
                  "inline-flex items-center rounded-full px-2.5 py-1",
                  "text-xs font-bold",
                  getStatusClasses(item),
                ].join(" ")}
              >
                {statusLabel}
              </span>
            ) : null}
          </div>

          <span className="text-xs font-medium text-[var(--trackit-text-muted)]">
            {formatDate(item.created_at)}
          </span>
        </div>

        <h2 className="mt-4 line-clamp-2 text-lg font-bold leading-7 text-[var(--trackit-navy)]">
          {item.title}
        </h2>

        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--trackit-text-muted)]">
          <span>{item.category}</span>

          <span aria-hidden="true">•</span>

          <span className="line-clamp-1">
            {item.location}
          </span>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
          {getItemSummary(item)}
        </p>

        <div className="mt-5">
          <Button
            href={`/items/${item.id}`}
            variant="outline"
            size="sm"
            fullWidth
          >
            View item
          </Button>
        </div>
      </div>
    </article>
  );
}

export function AuthenticatedDiscoverPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [type, setType] = useState<ItemType | "">("");

  const [categoryInput, setCategoryInput] = useState("");
  const [category, setCategory] = useState("");

  const [locationInput, setLocationInput] = useState("");
  const [location, setLocation] = useState("");

  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      type: type || undefined,
      category: category || undefined,
      location: location || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [
      category,
      location,
      page,
      search,
      type,
    ],
  );

  const {
    data: items = [],
    error,
    isError,
    isFetching,
    isLoading,
    refetch,
  } = usePublicItems(filters);

  const hasNextPage = items.length === PAGE_SIZE;

  useEffect(() => {
    setPage(1);
  }, [
    category,
    location,
    search,
    type,
  ]);

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function handleApplyFilters() {
    setCategory(categoryInput.trim());
    setLocation(locationInput.trim());
  }

  function handleClearFilters() {
    setSearchInput("");
    setSearch("");

    setType("");

    setCategoryInput("");
    setCategory("");

    setLocationInput("");
    setLocation("");

    setPage(1);
  }

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(type) ||
    Boolean(category) ||
    Boolean(location);

  return (
    <main className="min-h-screen bg-[var(--trackit-surface)] px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-3xl bg-[var(--trackit-deep-navy)] p-6 text-white shadow-sm sm:p-8 lg:p-10">
          <div className="flex flex-col gap-7">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
                Discover
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Find something that may bring it home.
              </h1>

              <p className="mt-4 text-base leading-7 text-[var(--trackit-text-on-dark)]">
                Browse recent lost and found posts, search for
                something specific, and explore the details that
                may help connect an item with its owner.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                href="/items/post-lost"
                variant="primary"
                size="md"
              >
                Post lost item
              </Button>

              <Button
                href="/items/post-found"
                variant="secondary"
                size="md"
              >
                Post found item
              </Button>
            </div>
          </div>
        </header>

        <section
          aria-label="Discover filters"
          className="mt-8 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
              Search
            </p>

            <h2 className="text-xl font-bold text-[var(--trackit-navy)]">
              Explore lost & found posts
            </h2>

            <p className="text-sm leading-6 text-[var(--trackit-text-muted)]">
              Narrow the feed by keyword, item type, category, or
              location.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="mt-6"
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
              <div>
                <label
                  htmlFor="authenticated-discover-search"
                  className="block text-sm font-semibold text-[var(--trackit-navy)]"
                >
                  Search
                </label>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="authenticated-discover-search"
                    type="search"
                    value={searchInput}
                    onChange={(event) =>
                      setSearchInput(event.target.value)
                    }
                    placeholder="Search by item title or description"
                    maxLength={100}
                    className="min-h-11 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="shrink-0"
                  >
                    Search
                  </Button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="authenticated-discover-type"
                  className="block text-sm font-semibold text-[var(--trackit-navy)]"
                >
                  Item type
                </label>

                <select
                  id="authenticated-discover-type"
                  value={type}
                  onChange={(event) =>
                    setType(
                      event.target.value as ItemType | "",
                    )
                  }
                  className="mt-2 min-h-11 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                >
                  {ITEM_TYPES.map((option) => (
                    <option
                      key={option.value || "all"}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="authenticated-discover-category"
                  className="block text-sm font-semibold text-[var(--trackit-navy)]"
                >
                  Category
                </label>

                <input
                  id="authenticated-discover-category"
                  type="text"
                  value={categoryInput}
                  onChange={(event) =>
                    setCategoryInput(event.target.value)
                  }
                  maxLength={100}
                  placeholder="e.g. Electronics, Documents"
                  className="mt-2 min-h-11 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="authenticated-discover-location"
                  className="block text-sm font-semibold text-[var(--trackit-navy)]"
                >
                  Location
                </label>

                <input
                  id="authenticated-discover-location"
                  type="text"
                  value={locationInput}
                  onChange={(event) =>
                    setLocationInput(event.target.value)
                  }
                  maxLength={255}
                  placeholder="e.g. Nairobi CBD"
                  className="mt-2 min-h-11 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-[var(--trackit-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleApplyFilters}
                  disabled={
                    categoryInput.trim() === category &&
                    locationInput.trim() === location
                  }
                >
                  Apply filters
                </Button>

                {hasActiveFilters ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Clear filters
                  </Button>
                ) : null}
              </div>

              {isFetching && !isLoading ? (
                <p className="text-sm font-medium text-[var(--trackit-text-muted)]">
                  Updating results...
                </p>
              ) : null}
            </div>
          </form>
        </section>

        <section
          className="mt-10"
          aria-labelledby="discover-results-heading"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                Community posts
              </p>

              <h2
                id="discover-results-heading"
                className="mt-2 text-xl font-bold text-[var(--trackit-navy)]"
              >
                Recent items
              </h2>

              <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Showing publicly visible lost and found posts.
              </p>
            </div>

            {items.length > 0 ? (
              <p className="text-sm font-semibold text-[var(--trackit-text-muted)]">
                Page {page}
              </p>
            ) : null}
          </div>

          <div className="mt-5">
            {isLoading ? (
              <AuthenticatedDiscoverSkeleton />
            ) : isError ? (
              <div
                role="alert"
                className="rounded-2xl border border-[var(--trackit-danger-soft)] bg-[var(--trackit-danger-soft)] px-5 py-6"
              >
                <h2 className="text-base font-bold text-[var(--trackit-danger-text)]">
                  We couldn't load the Discover feed.
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--trackit-danger-text)]">
                  {error instanceof Error
                    ? error.message
                    : "Please check your connection and try again."}
                </p>

                <div className="mt-5">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      void refetch();
                    }}
                  >
                    Try again
                  </Button>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-6 py-12 text-center">
                <h2 className="text-lg font-bold text-[var(--trackit-navy)]">
                  No matching posts
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--trackit-text-muted)]">
                  Try changing your search or filters. You can
                  also post a lost or found item if you have
                  something to report.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  {hasActiveFilters ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      Clear filters
                    </Button>
                  ) : null}

                  <Button
                    href="/items/post-lost"
                    variant="primary"
                    size="sm"
                  >
                    Post lost item
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <DiscoverItemCard
                      key={item.id}
                      item={item}
                    />
                  ))}
                </div>

                <nav
                  aria-label="Discover pagination"
                  className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--trackit-border)] pt-6"
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((currentPage) =>
                        Math.max(1, currentPage - 1),
                      )
                    }
                    disabled={page === 1 || isFetching}
                  >
                    Previous
                  </Button>

                  <span className="text-sm font-semibold text-[var(--trackit-navy)]">
                    Page {page}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((currentPage) =>
                        currentPage + 1,
                      )
                    }
                    disabled={!hasNextPage || isFetching}
                  >
                    Next
                  </Button>
                </nav>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
