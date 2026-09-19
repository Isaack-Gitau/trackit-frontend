import { Link } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useMyClaims } from "../../hooks/useMyClaims";
import { useMyItems } from "../../hooks/useMyItems";
import { useProfile } from "../../hooks/useProfile";
import type { Claim } from "../../types/claim";
import type { Item, ItemStatus } from "../../types/item";
import type { Profile } from "../../types/profile";

function getDisplayName(profile: Profile | undefined, username?: string): string {
  if (!profile) {
    return username || "there";
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return fullName || profile.username || username || "there";
}

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

function getItemStatusLabel(status: ItemStatus): string {
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

function getItemStatusClasses(status: ItemStatus): string {
  switch (status) {
    case "pending":
      return "bg-[var(--trackit-warning-soft)] text-[var(--trackit-warning)]";
    case "approved":
      return "bg-[var(--trackit-success-soft)] text-[var(--trackit-success)]";
    case "rejected":
      return "bg-[var(--trackit-danger-soft)] text-[var(--trackit-danger-text)]";
    case "claimed":
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue-dark)]";
    default:
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue-dark)]";
  }
}

function getClaimStatusLabel(status: Claim["status"]): string {
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

function getClaimStatusClasses(status: Claim["status"]): string {
  switch (status) {
    case "pending":
      return "bg-[var(--trackit-warning-soft)] text-[var(--trackit-warning)]";
    case "approved":
      return "bg-[var(--trackit-success-soft)] text-[var(--trackit-success)]";
    case "rejected":
      return "bg-[var(--trackit-danger-soft)] text-[var(--trackit-danger-text)]";
    case "withdrawn":
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue-dark)]";
    default:
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue-dark)]";
  }
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm">
      <p className="text-sm font-semibold text-[var(--trackit-text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--trackit-navy)]">
        {value}
      </p>

      <p className="mt-1 text-sm leading-5 text-[var(--trackit-text-muted)]">
        {description}
      </p>
    </article>
  );
}

function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-bold text-[var(--trackit-navy)]">
          {title}
        </h2>
      </div>

      {href && linkLabel ? (
        <Link
          to={href}
          className="inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-semibold text-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          {linkLabel}
          <span className="ml-1" aria-hidden="true">
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}

export function DashboardPage() {
  const { accessToken, user } = useAuth();

  const profileQuery = useProfile(accessToken);
  const itemsQuery = useMyItems(accessToken);
  const claimsQuery = useMyClaims(accessToken);

  const profile = profileQuery.data;
  const items = itemsQuery.data ?? [];
  const claims = claimsQuery.data ?? [];

  const displayName = getDisplayName(profile, user?.username);

  const lostItems = items.filter((item) => item.type === "lost");
  const foundItems = items.filter((item) => item.type === "found");
  const claimedItems = items.filter((item) => item.status === "claimed");

  const pendingItems = items.filter(
    (item) => item.status === "pending",
  );
  const rejectedItems = items.filter(
    (item) => item.status === "rejected",
  );

  const pendingClaims = claims.filter(
    (claim) => claim.status === "pending",
  );
  const rejectedClaims = claims.filter(
    (claim) => claim.status === "rejected",
  );

  const recentItems = [...items]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    )
    .slice(0, 4);

  const recentClaims = [...claims]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    )
    .slice(0, 4);

  const isLoading =
    profileQuery.isLoading ||
    itemsQuery.isLoading ||
    claimsQuery.isLoading;

  const hasError =
    profileQuery.isError ||
    itemsQuery.isError ||
    claimsQuery.isError;

  return (
    <main className="min-h-screen bg-[var(--trackit-surface)] px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <header className="rounded-3xl bg-[var(--trackit-deep-navy)] p-6 text-white shadow-sm sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
                Your TrackIt dashboard
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back, {user?.username || "there"}.
              </h1>

              <p className="mt-4 text-base leading-7 text-[var(--trackit-text-on-dark)]">
                Keep track of the items you have posted, claims you
                have submitted, and the next steps that need your
                attention.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
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

        <section className="mt-8" aria-labelledby="quick-actions-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                Get started
              </p>

              <h2
                id="quick-actions-heading"
                className="mt-2 text-xl font-bold text-[var(--trackit-navy)]"
              >
                What would you like to do?
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Link
              to="/items/post-lost"
              className="group rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--trackit-blue-soft)] text-xl text-[var(--trackit-blue)]">
                +
              </span>

              <h3 className="mt-4 font-bold text-[var(--trackit-navy)]">
                Post something lost
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Tell the community what you are looking for.
              </p>
            </Link>

            <Link
              to="/items/post-found"
              className="group rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--trackit-blue-soft)] text-xl text-[var(--trackit-blue)]">
                ✓
              </span>

              <h3 className="mt-4 font-bold text-[var(--trackit-navy)]">
                Post something found
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Help someone identify and recover their item.
              </p>
            </Link>

            <Link
              to="/discover"
              className="group rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--trackit-blue-soft)] text-xl text-[var(--trackit-blue)]">
                ↗
              </span>

              <h3 className="mt-4 font-bold text-[var(--trackit-navy)]">
                Discover items
              </h3>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Browse community posts and possible matches.
              </p>
            </Link>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="activity-heading">
          <SectionHeader
            eyebrow="Your activity"
            title="A quick look at your posts"
            href="/items"
            linkLabel="View my items"
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total posts"
              value={items.length}
              description="All items you have posted"
            />

            <StatCard
              label="Lost"
              value={lostItems.length}
              description="Items you posted as lost"
            />

            <StatCard
              label="Found"
              value={foundItems.length}
              description="Items you posted as found"
            />

            <StatCard
              label="Claimed"
              value={claimedItems.length}
              description="Your posts marked as claimed"
            />
          </div>
        </section>

        <section className="mt-10" aria-labelledby="attention-heading">
          <SectionHeader
            eyebrow="Next steps"
            title="Needs your attention"
          />

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[var(--trackit-navy)]">
                    Item posts
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    Posts that may need you to check their current
                    status.
                  </p>
                </div>

                <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--trackit-blue-soft)] px-3 text-sm font-bold text-[var(--trackit-blue-dark)]">
                  {pendingItems.length + rejectedItems.length}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {pendingItems.length > 0 ? (
                  <Link
                    to="/items"
                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-4 py-3 text-sm transition hover:border-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    <span className="text-[var(--trackit-navy)]">
                      {pendingItems.length} post
                      {pendingItems.length === 1 ? "" : "s"} pending
                      review
                    </span>

                    <span className="font-semibold text-[var(--trackit-blue)]">
                      Review →
                    </span>
                  </Link>
                ) : null}

                {rejectedItems.length > 0 ? (
                  <Link
                    to="/items"
                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-4 py-3 text-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    <span className="text-[var(--trackit-danger-text)]">
                      {rejectedItems.length} post
                      {rejectedItems.length === 1 ? "" : "s"} rejected
                    </span>

                    <span className="font-semibold text-[var(--trackit-danger-text)]">
                      Review →
                    </span>
                  </Link>
                ) : null}

                {pendingItems.length === 0 &&
                rejectedItems.length === 0 ? (
                  <p className="rounded-xl bg-[var(--trackit-surface-blue)] px-4 py-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    Nothing from your item posts needs attention
                    right now.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[var(--trackit-navy)]">
                    Claims
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    Keep an eye on claims you have submitted.
                  </p>
                </div>

                <span className="flex h-10 min-w-10 items-center justify-center rounded-full bg-[var(--trackit-blue-soft)] px-3 text-sm font-bold text-[var(--trackit-blue-dark)]">
                  {pendingClaims.length + rejectedClaims.length}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {pendingClaims.length > 0 ? (
                  <Link
                    to="/claims"
                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] px-4 py-3 text-sm transition hover:border-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    <span className="text-[var(--trackit-navy)]">
                      {pendingClaims.length} claim
                      {pendingClaims.length === 1 ? "" : "s"} pending
                      review
                    </span>

                    <span className="font-semibold text-[var(--trackit-blue)]">
                      View claims →
                    </span>
                  </Link>
                ) : null}

                {rejectedClaims.length > 0 ? (
                  <Link
                    to="/claims"
                    className="flex items-center justify-between gap-4 rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-4 py-3 text-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    <span className="text-[var(--trackit-danger-text)]">
                      {rejectedClaims.length} claim
                      {rejectedClaims.length === 1 ? "" : "s"} rejected
                    </span>

                    <span className="font-semibold text-[var(--trackit-danger-text)]">
                      View claims →
                    </span>
                  </Link>
                ) : null}

                {pendingClaims.length === 0 &&
                rejectedClaims.length === 0 ? (
                  <p className="rounded-xl bg-[var(--trackit-surface-blue)] px-4 py-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    You have no claims that need attention right now.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="recent-items-heading">
          <SectionHeader
            eyebrow="Your posts"
            title="Recent items"
            href="/items"
            linkLabel="View all items"
          />

          <div className="mt-5">
            {isLoading ? (
              <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 text-sm text-[var(--trackit-text-muted)] shadow-sm">
                Loading your recent items…
              </div>
            ) : hasError && itemsQuery.isError ? (
              <div
                role="alert"
                className="rounded-2xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] p-6 text-sm leading-6 text-[var(--trackit-danger-text)]"
              >
                We could not load your recent items right now. Please
                try again shortly.
              </div>
            ) : recentItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-8 text-center shadow-sm">
                <h3 className="font-bold text-[var(--trackit-navy)]">
                  No posts yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--trackit-text-muted)]">
                  When you post a lost or found item, your recent
                  posts will appear here.
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
                    variant="secondary"
                    size="sm"
                    className="!text-white"
                  >
                    Post found item
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {recentItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/items/${item.id}`}
                    className="group overflow-hidden rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    <div className="flex min-h-32">
                      <div className="flex w-32 shrink-0 items-center justify-center bg-[var(--trackit-surface-blue)]">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt=""
                            className="h-full min-h-32 w-full object-cover"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="text-3xl text-[var(--trackit-blue)]"
                          >
                            {item.type === "lost" ? "?" : "✓"}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[var(--trackit-blue-soft)] px-2.5 py-1 text-xs font-semibold capitalize text-[var(--trackit-blue-dark)]">
                            {item.type}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getItemStatusClasses(item.status)}`}
                          >
                            {getItemStatusLabel(item.status)}
                          </span>
                        </div>

                        <h3 className="mt-3 line-clamp-2 font-bold text-[var(--trackit-navy)] group-hover:text-[var(--trackit-blue)]">
                          {item.title}
                        </h3>

                        <p className="mt-1 truncate text-sm text-[var(--trackit-text-muted)]">
                          {item.location}
                        </p>

                        <p className="mt-2 text-xs text-[var(--trackit-text-muted)]">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="recent-claims-heading">
          <SectionHeader
            eyebrow="Claim activity"
            title="Recent claims"
            href="/claims"
            linkLabel="View all claims"
          />

          <div className="mt-5">
            {isLoading ? (
              <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 text-sm text-[var(--trackit-text-muted)] shadow-sm">
                Loading your recent claims…
              </div>
            ) : claimsQuery.isError ? (
              <div
                role="alert"
                className="rounded-2xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] p-6 text-sm leading-6 text-[var(--trackit-danger-text)]"
              >
                We could not load your recent claims right now. Please
                try again shortly.
              </div>
            ) : recentClaims.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-8 text-center shadow-sm">
                <h3 className="font-bold text-[var(--trackit-navy)]">
                  No claims yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--trackit-text-muted)]">
                  Claims you submit for found items will appear here.
                </p>

                <Link
                  to="/discover"
                  className="mt-5 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold text-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] hover:text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Discover items
                  <span className="ml-1" aria-hidden="true">
                    →
                  </span>
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm">
                <div className="divide-y divide-[var(--trackit-border)]">
                  {recentClaims.map((claim) => (
                    <Link
                      key={claim.id}
                      to="/claims"
                      className="flex flex-col gap-3 px-5 py-5 transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--trackit-blue-bright)] sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--trackit-navy)]">
                          Claim #{claim.id}
                        </p>

                        <p className="mt-1 text-sm text-[var(--trackit-text-muted)]">
                          Item #{claim.item_id} · Submitted{" "}
                          {formatDate(claim.created_at)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${getClaimStatusClasses(claim.status)}`}
                      >
                        {getClaimStatusLabel(claim.status)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
              Trust & safety
            </p>

            <h2 className="mt-2 text-xl font-bold text-[var(--trackit-navy)]">
              Keep every return safe and verifiable.
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
              Use accurate item information, avoid sharing sensitive
              personal details publicly, and verify ownership carefully
              before handing an item over.
            </p>

            <Link
              to="/safety"
              className="mt-4 inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-bold text-[var(--trackit-blue)] hover:bg-[var(--trackit-surface)] hover:text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              Review TrackIt safety guidance
              <span className="ml-1" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
