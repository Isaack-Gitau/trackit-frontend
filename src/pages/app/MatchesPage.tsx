import { Link } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { Skeleton } from "../../components/ui/Skeleton";

import { useAuth } from "../../context/AuthContext";
import {
  useDismissMatch,
  useMyMatches,
  useRestoreMatch,
} from "../../hooks/useMatches";
import { useMyItems } from "../../hooks/useMyItems";
import { usePublicItem } from "../../hooks/usePublicItem";

import type { Item, ItemType } from "../../types/item";
import type { Match, MatchLevel } from "../../types/match";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getMatchLevelLabel(level: MatchLevel): string {
  switch (level) {
    case "strong":
      return "Strong match";

    case "possible":
      return "Possible match";

    case "none":
      return "Low match";

    default:
      return level;
  }
}

function getMatchLevelClasses(level: MatchLevel): string {
  switch (level) {
    case "strong":
      return "bg-[var(--trackit-success-soft)] text-[var(--trackit-success)]";

    case "possible":
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue-dark)]";

    case "none":
      return "bg-[var(--trackit-border)] text-[var(--trackit-text-muted)]";

    default:
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue-dark)]";
  }
}

function getTypeLabel(type: ItemType): string {
  return type === "lost" ? "Lost item" : "Found item";
}

function getTypeClasses(type: ItemType): string {
  if (type === "lost") {
    return "bg-[var(--trackit-warning-soft)] text-[var(--trackit-warning)]";
  }

  return "bg-[var(--trackit-success-soft)] text-[var(--trackit-success)]";
}

function getScoreLabel(score: number): string {
  return `${score}% match`;
}

function isPubliclyViewable(item: Item): boolean {
  return item.status === "approved" || item.status === "claimed";
}

function MatchItemCard({
  item,
  label,
}: {
  item: Item;
  label: string;
}) {
  const canViewItem = isPubliclyViewable(item);

  return (
    <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--trackit-text-muted)]">
            {label}
          </p>

          <span
            className={[
              "mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
              getTypeClasses(item.type),
            ].join(" ")}
          >
            {getTypeLabel(item.type)}
          </span>
        </div>

        <span className="text-xs text-[var(--trackit-text-muted)]">
          {formatDate(item.created_at)}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-bold text-[var(--trackit-navy)]">
        {item.title}
      </h3>

      <div className="mt-2 space-y-1 text-sm text-[var(--trackit-text-muted)]">
        <p>{item.category}</p>
        <p>{item.location}</p>
      </div>

      {canViewItem ? (
        <Link
          to={`/items/${item.id}`}
          className="mt-4 inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold text-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          View item
          <span className="ml-1" aria-hidden="true">
            →
          </span>
        </Link>
      ) : (
        <p className="mt-4 text-xs leading-5 text-[var(--trackit-text-muted)]">
          This post is not publicly viewable right now.
        </p>
      )}
    </div>
  );
}

function MatchItemUnavailable({
  label,
  loading = false,
}: {
  label: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] p-4">
      <p className="text-sm font-semibold text-[var(--trackit-text-muted)]">
        {label}
      </p>

      {loading ? (
        <div
          className="mt-3 flex items-center gap-2 text-sm text-[var(--trackit-text-muted)]"
          aria-live="polite"
        >
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--trackit-border)] border-t-[var(--trackit-blue)]"
            aria-hidden="true"
          />
          Loading item details...
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--trackit-text-muted)]">
          Item details are no longer publicly available.
        </p>
      )}
    </div>
  );
}

function MatchSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-7 w-32 rounded-full" />
        <Skeleton className="h-5 w-20 rounded" />
      </div>

      <Skeleton className="mt-4 h-5 w-48 rounded" />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>

      <Skeleton className="mt-4 h-16 rounded-xl" />
    </div>
  );
}

function MatchCard({
  match,
  lostItem,
  foundItem,
  onDismiss,
  onRestore,
  isDismissing,
  isRestoring,
}: {
  match: Match;
  lostItem: Item | undefined;
  foundItem: Item | undefined;
  onDismiss: (matchId: number) => void;
  onRestore: (matchId: number) => void;
  isDismissing: boolean;
  isRestoring: boolean;
}) {
  const lostItemQuery = usePublicItem(
    lostItem ? null : match.lost_item_id,
  );

  const foundItemQuery = usePublicItem(
    foundItem ? null : match.found_item_id,
  );

  const resolvedLostItem = lostItem ?? lostItemQuery.data;
  const resolvedFoundItem = foundItem ?? foundItemQuery.data;

  const lostItemLoading =
    !lostItem &&
    lostItemQuery.isLoading;

  const foundItemLoading =
    !foundItem &&
    foundItemQuery.isLoading;

  return (
    <article
      className={[
        "rounded-2xl border bg-[var(--trackit-surface)] p-5 shadow-sm",
        match.is_dismissed
          ? "border-[var(--trackit-border)] opacity-85"
          : "border-[var(--trackit-border)]",
      ].join(" ")}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 text-xs font-bold",
              getMatchLevelClasses(match.match_level),
            ].join(" ")}
          >
            {getMatchLevelLabel(match.match_level)}
          </span>

          {match.is_dismissed ? (
            <span className="inline-flex rounded-full bg-[var(--trackit-border)] px-3 py-1 text-xs font-semibold text-[var(--trackit-text-muted)]">
              Dismissed
            </span>
          ) : null}
        </div>

        <p className="text-sm font-bold text-[var(--trackit-navy)]">
          {getScoreLabel(match.score)}
        </p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {resolvedLostItem ? (
          <MatchItemCard
            item={resolvedLostItem}
            label="Lost side"
          />
        ) : (
          <MatchItemUnavailable
            label="Lost item"
            loading={lostItemLoading}
          />
        )}

        {resolvedFoundItem ? (
          <MatchItemCard
            item={resolvedFoundItem}
            label="Found side"
          />
        ) : (
          <MatchItemUnavailable
            label="Found item"
            loading={foundItemLoading}
          />
        )}
      </div>

      <div className="mt-4 rounded-xl bg-[var(--trackit-surface-blue)] px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
          Why TrackIt flagged this
        </p>

        <p className="mt-2 text-sm leading-6 text-[var(--trackit-text)]">
          {match.reason}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--trackit-text-muted)]">
        <span>Category: {match.category_score}</span>
        <span>Title: {match.title_score}</span>
        <span>Description: {match.description_score}</span>
        <span>Location: {match.location_score}</span>
        <span>Time: {match.time_score}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--trackit-border)] pt-4">
        <p className="text-xs text-[var(--trackit-text-muted)]">
          Match identified {formatDate(match.created_at)}.
        </p>

        <div className="flex flex-wrap gap-2">
          {match.is_dismissed ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isRestoring}
              disabled={isRestoring || isDismissing}
              onClick={() => onRestore(match.id)}
            >
              Restore match
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isDismissing}
              disabled={isDismissing || isRestoring}
              onClick={() => onDismiss(match.id)}
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function MatchesPage() {
  const { accessToken } = useAuth();

  const matchesQuery = useMyMatches(accessToken, true);
  const itemsQuery = useMyItems(accessToken);

  const dismissMutation = useDismissMatch(accessToken);
  const restoreMutation = useRestoreMatch(accessToken);

  const matches = matchesQuery.data ?? [];
  const items = itemsQuery.data ?? [];

  const itemMap = new Map(
    items.map((item) => [item.id, item]),
  );

  const activeMatches = matches.filter(
    (match) => !match.is_dismissed,
  );

  const dismissedMatches = matches.filter(
    (match) => match.is_dismissed,
  );

  const handleDismiss = (matchId: number) => {
    dismissMutation.mutate(matchId);
  };

  const handleRestore = (matchId: number) => {
    restoreMutation.mutate(matchId);
  };

  const isLoading =
    matchesQuery.isLoading ||
    itemsQuery.isLoading;

  const isError =
    matchesQuery.isError ||
    itemsQuery.isError;

  return (
    <main className="min-h-screen bg-[var(--trackit-surface)] px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-3xl bg-[var(--trackit-deep-navy)] p-6 text-white shadow-sm sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
              Your matches
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Possible connections between your posts.
            </h1>

            <p className="mt-4 text-base leading-7 text-[var(--trackit-text-on-dark)]">
              TrackIt compares lost and found posts to identify
              possible connections. A match is a useful lead, not
              proof of ownership.
            </p>
          </div>
        </header>

        {isError ? (
          <section
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-5"
            role="alert"
          >
            <h2 className="font-bold text-red-900">
              We could not load your matches.
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-800">
              Please try again. If the problem continues, check your
              connection and make sure your TrackIt session is still
              active.
            </p>

            <Button
              type="button"
              variant="primary"
              size="sm"
              className="mt-4"
              onClick={() => {
                void matchesQuery.refetch();
                void itemsQuery.refetch();
              }}
            >
              Try again
            </Button>
          </section>
        ) : null}

        {isLoading ? (
          <section
            className="mt-8 space-y-5"
            aria-label="Loading matches"
          >
            <MatchSkeleton />
            <MatchSkeleton />
          </section>
        ) : null}

        {!isLoading && !isError ? (
          <>
            <section
              className="mt-8"
              aria-labelledby="active-matches-heading"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                    Active matches
                  </p>

                  <h2
                    id="active-matches-heading"
                    className="mt-2 text-xl font-bold text-[var(--trackit-navy)]"
                  >
                    Possible connections
                  </h2>
                </div>

                <p className="text-sm text-[var(--trackit-text-muted)]">
                  {activeMatches.length}{" "}
                  {activeMatches.length === 1
                    ? "match"
                    : "matches"}
                </p>
              </div>

              {activeMatches.length > 0 ? (
                <div className="mt-5 space-y-5">
                  {activeMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      lostItem={itemMap.get(match.lost_item_id)}
                      foundItem={itemMap.get(match.found_item_id)}
                      onDismiss={handleDismiss}
                      onRestore={handleRestore}
                      isDismissing={
                        dismissMutation.isPending &&
                        dismissMutation.variables === match.id
                      }
                      isRestoring={
                        restoreMutation.isPending &&
                        restoreMutation.variables === match.id
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 py-8 text-center shadow-sm">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--trackit-blue-soft)] text-xl text-[var(--trackit-blue)]">
                    ✓
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-[var(--trackit-navy)]">
                    No active matches yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--trackit-text-muted)]">
                    When TrackIt identifies a possible connection
                    between your lost and found posts, it will appear
                    here.
                  </p>

                  <Link
                    to="/discover"
                    className="mt-5 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold text-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    Discover posts
                    <span className="ml-1" aria-hidden="true">
                      →
                    </span>
                  </Link>
                </div>
              )}
            </section>

            {dismissedMatches.length > 0 ? (
              <section
                className="mt-10"
                aria-labelledby="dismissed-matches-heading"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-text-muted)]">
                    Dismissed
                  </p>

                  <h2
                    id="dismissed-matches-heading"
                    className="mt-2 text-xl font-bold text-[var(--trackit-navy)]"
                  >
                    Matches you set aside
                  </h2>
                </div>

                <div className="mt-5 space-y-5">
                  {dismissedMatches.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      lostItem={itemMap.get(match.lost_item_id)}
                      foundItem={itemMap.get(match.found_item_id)}
                      onDismiss={handleDismiss}
                      onRestore={handleRestore}
                      isDismissing={
                        dismissMutation.isPending &&
                        dismissMutation.variables === match.id
                      }
                      isRestoring={
                        restoreMutation.isPending &&
                        restoreMutation.variables === match.id
                      }
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {matches.length === 0 ? (
              <section className="mt-8 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-5 py-8 text-center">
                <h2 className="text-lg font-bold text-[var(--trackit-navy)]">
                  Matches will appear here
                </h2>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[var(--trackit-text-muted)]">
                  Keep your lost and found posts detailed and accurate.
                  TrackIt can use those details to identify potential
                  connections.
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Button
                    href="/items/post-lost"
                    variant="primary"
                    size="sm"
                  >
                    Post lost item
                  </Button>

                  <Button
                    href="/items/post-found"
                    variant="outline"
                    size="sm"
                  >
                    Post found item
                  </Button>
                </div>
              </section>
            ) : null}

            <section className="mt-10 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-5 py-5">
              <p className="text-sm font-semibold text-[var(--trackit-navy)]">
                Remember: a match is a possibility, not confirmation.
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Review the relevant item details and use the TrackIt
                claim and verification process before treating a
                potential match as a successful return.
              </p>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
