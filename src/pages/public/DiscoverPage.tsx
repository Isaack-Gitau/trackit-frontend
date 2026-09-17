import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../api/errors";
import { usePublicItems } from "../../hooks/usePublicItems";

import type { ItemType } from "../../types/item";

export function DiscoverPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ItemType | "">("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      search: search || undefined,
      type: type || undefined,
      category: category || undefined,
      location: location || undefined,
      page,
      limit: 12,
    }),
    [search, type, category, location, page],
  );

  const {
    data: items = [],
    isLoading,
    isError,
    error,
  } = usePublicItems(filters);

  const hasNextPage = items.length === 12;
  const hasPreviousPage = page > 1;

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function handleTypeChange(value: ItemType | "") {
    setType(value);
    setPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategory(value);
    setPage(1);
  }

  function handleLocationChange(value: string) {
    setLocation(value);
    setPage(1);
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setType("");
    setCategory("");
    setLocation("");
    setPage(1);
  }

  return (
    <div className="bg-[var(--trackit-surface)]">
      <section className="bg-[var(--trackit-midnight)] px-5 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
              Public discovery
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find reports that may help bring something home.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--trackit-text-on-dark)] sm:text-lg">
              Explore approved lost and found reports. Use the search and
              filters to narrow the results and review the details of each
              item.
            </p>
          </div>
        </div>
      </section>

      <main className="px-5 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <section
            aria-labelledby="discovery-filters-heading"
            className="rounded-3xl border border-[var(--trackit-border)] bg-white p-5 shadow-sm sm:p-7"
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Search reports
              </p>

              <h2
                id="discovery-filters-heading"
                className="mt-2 text-2xl font-extrabold text-[var(--trackit-navy)]"
              >
                What are you looking for?
              </h2>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]"
            >
              <div>
                <label
                  htmlFor="discovery-search"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Search
                </label>

                <input
                  id="discovery-search"
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search by item, description, category, or location"
                  className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="min-h-12 w-full rounded-xl bg-[var(--trackit-blue)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 lg:w-auto"
                >
                  Search reports
                </button>
              </div>
            </form>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="discovery-type"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Report type
                </label>

                <select
                  id="discovery-type"
                  value={type}
                  onChange={(event) =>
                    handleTypeChange(event.target.value as ItemType | "")
                  }
                  className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-sm outline-none focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                >
                  <option value="">All reports</option>
                  <option value="lost">Lost items</option>
                  <option value="found">Found items</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="discovery-category"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Category
                </label>

                <input
                  id="discovery-category"
                  type="text"
                  value={category}
                  onChange={(event) =>
                    handleCategoryChange(event.target.value)
                  }
                  placeholder="e.g. Electronics"
                  className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-sm outline-none focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                />
              </div>

              <div>
                <label
                  htmlFor="discovery-location"
                  className="mb-2 block text-sm font-bold text-[var(--trackit-navy)]"
                >
                  Location
                </label>

                <input
                  id="discovery-location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    handleLocationChange(event.target.value)
                  }
                  placeholder="e.g. University Library"
                  className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-sm outline-none focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="min-h-10 rounded-lg px-3 text-sm font-bold text-[var(--trackit-blue)] transition-colors hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                Clear filters
              </button>
            </div>
          </section>

          <section
            aria-labelledby="discovery-results-heading"
            className="mt-12"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Results
                </p>

                <h2
                  id="discovery-results-heading"
                  className="mt-2 text-3xl font-extrabold text-[var(--trackit-navy)]"
                >
                  Public item reports
                </h2>
              </div>

              {!isLoading && !isError && (
                <p className="text-sm text-[var(--trackit-text-muted)]">
                  Page {page}
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <DiscoveryResultSkeleton key={index} />
                ))}
              </div>
            ) : isError ? (
              <div className="mt-7 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
                <h3 className="text-lg font-bold text-red-900">
                  We couldn't load the reports
                </h3>

                <p className="mt-2 text-sm leading-7 text-red-800">
                  {getApiErrorMessage(error)}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-5 min-h-11 rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white hover:bg-[var(--trackit-blue-hover)]"
                >
                  Try again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-dashed border-[var(--trackit-border)] bg-white px-6 py-12 text-center">
                <h3 className="text-lg font-bold text-[var(--trackit-navy)]">
                  No matching reports found
                </h3>

                <p className="mt-2 text-sm leading-7 text-[var(--trackit-text-muted)]">
                  Try adjusting your search terms or clearing some filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 min-h-11 rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white hover:bg-[var(--trackit-blue-hover)]"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/items/${item.id}`}
                      className="group overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          className="h-48 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-[var(--trackit-surface-blue)] text-[var(--trackit-blue)]">
                          <ItemPlaceholderIcon />
                        </div>
                      )}

                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              "rounded-full px-3 py-1 text-xs font-bold uppercase",
                              item.type === "lost"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800",
                            ].join(" ")}
                          >
                            {item.type}
                          </span>

                          <span className="rounded-full bg-[var(--trackit-surface-blue)] px-3 py-1 text-xs font-bold text-[var(--trackit-navy)]">
                            {item.status === "claimed"
                              ? "Claimed"
                              : "Available"}
                          </span>
                        </div>

                        <h3 className="mt-4 text-lg font-extrabold text-[var(--trackit-navy)] group-hover:text-[var(--trackit-blue)]">
                          {item.title}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                          {item.description}
                        </p>

                        <div className="mt-4 space-y-2 border-t border-[var(--trackit-border)] pt-4 text-sm">
                          <p className="text-[var(--trackit-text-muted)]">
                            <span className="font-bold text-[var(--trackit-navy)]">
                              Category:
                            </span>{" "}
                            {item.category}
                          </p>

                          <p className="text-[var(--trackit-text-muted)]">
                            <span className="font-bold text-[var(--trackit-navy)]">
                              Location:
                            </span>{" "}
                            {item.location}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    disabled={!hasPreviousPage}
                    onClick={() => setPage((current) => current - 1)}
                    className="min-h-11 rounded-lg border border-[var(--trackit-border)] bg-white px-5 text-sm font-bold text-[var(--trackit-navy)] disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm font-semibold text-[var(--trackit-text-muted)]">
                    Page {page}
                  </span>

                  <button
                    type="button"
                    disabled={!hasNextPage}
                    onClick={() => setPage((current) => current + 1)}
                    className="min-h-11 rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white hover:bg-[var(--trackit-blue-hover)] disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function DiscoveryResultSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-white">
      <div className="h-48 bg-[var(--trackit-blue-soft)]" />

      <div className="space-y-4 p-5">
        <div className="h-6 w-20 rounded-full bg-[var(--trackit-blue-soft)]" />
        <div className="h-5 w-3/4 rounded bg-[var(--trackit-blue-soft)]" />
        <div className="h-4 w-full rounded bg-[var(--trackit-blue-soft)]" />
        <div className="h-4 w-5/6 rounded bg-[var(--trackit-blue-soft)]" />
      </div>
    </div>
  );
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
