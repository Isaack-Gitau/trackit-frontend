import { Link } from "react-router-dom";

import { usePublicItems } from "../../hooks/usePublicItems";

import { Skeleton } from "../ui/Skeleton";

export function DiscoverySection() {
  const {
    data: items = [],
    isLoading,
    isError,
  } = usePublicItems({
    page: 1,
    limit: 4,
  });

  return (
    <section className="bg-[var(--trackit-deep-navy)] py-16 text-white sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
              Discover
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Search reports without sorting through scattered posts.
            </h2>

            <p className="mt-5 text-base leading-8 text-[var(--trackit-text-on-dark)] sm:text-lg">
              TrackIt is designed around structured item reports, making it
              easier to describe, discover, and compare the details that can
              help identify a missing belonging.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/discover"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-deep-navy)]"
              >
                Explore reports
              </Link>

              <Link
                to="/items/report-lost"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-deep-navy)]"
              >
                Report something lost
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[var(--trackit-midnight)] p-5 shadow-2xl shadow-black/20 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue-bright)]">
                  Public discovery
                </p>

                <h3 className="mt-1 text-lg font-bold text-white">
                  Recent item reports
                </h3>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[var(--trackit-text-on-dark)]">
                Live data
              </span>
            </div>

            <div className="mt-5">
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <DiscoverySkeleton />
                  <DiscoverySkeleton />
                  <DiscoverySkeleton />
                  <DiscoverySkeleton />
                </div>
              ) : isError ? (
                <DiscoveryMessage>
                  We couldn't load recent reports right now. Please try again
                  from the Discover page.
                </DiscoveryMessage>
              ) : items.length === 0 ? (
                <DiscoveryMessage>
                  There are no public item reports available yet. New approved
                  reports will appear here.
                </DiscoveryMessage>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      to={`/items/${item.id}`}
                      className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-midnight)]"
                    >
                      <div className="flex gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="h-16 w-16 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[var(--trackit-text-on-dark)]"
                          >
                            <ItemPlaceholderIcon />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <span
                            className={[
                              "inline-flex rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
                              item.type === "lost"
                                ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
                                : "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
                            ].join(" ")}
                          >
                            {item.type}
                          </span>

                          <h4 className="mt-2 truncate text-sm font-bold text-white group-hover:text-[var(--trackit-blue-bright)]">
                            {item.title}
                          </h4>

                          <p className="mt-1 truncate text-xs text-[var(--trackit-text-on-dark)]">
                            {item.location}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-[var(--trackit-text-on-dark)]">
                          {item.category}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-[var(--trackit-text-on-dark)]">
                          {item.status === "claimed"
                            ? "Claimed"
                            : "Available"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {!isLoading && !isError && items.length > 0 && (
              <div className="mt-5 rounded-xl border border-dashed border-white/15 px-4 py-4 text-center">
                <p className="text-sm text-[var(--trackit-text-on-dark)]">
                  Browse all public reports and use search and filters to
                  narrow your results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function DiscoveryMessage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-5 py-8 text-center">
      <p className="text-sm leading-6 text-[var(--trackit-text-on-dark)]">
        {children}
      </p>
    </div>
  );
}

function DiscoverySkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex gap-3">
        <Skeleton className="h-16 w-16 shrink-0 rounded-xl bg-white/10" />

        <div className="min-w-0 flex-1">
          <Skeleton className="h-3 w-24 bg-white/10" />
          <Skeleton className="mt-3 h-3 w-full bg-white/10" />
          <Skeleton className="mt-2 h-3 w-2/3 bg-white/10" />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
        <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
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
      className="h-7 w-7"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m21 15-4.5-4.5L7 20" />
    </svg>
  );
}
