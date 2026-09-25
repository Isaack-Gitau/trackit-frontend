import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import { API_BASE_URL } from "../../api/config";
import { getApiErrorMessage } from "../../api/errors";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useCreateClaim } from "../../hooks/useClaimMutations";
import {
  useCreateItemComment,
  useDeleteComment,
  useUpdateComment,
} from "../../hooks/useItemCommentMutations";
import { useItemComments } from "../../hooks/useItemComments";
import { useCreateReport } from "../../hooks/useReports";
import { useMyClaims } from "../../hooks/useMyClaims";
import { usePublicItem } from "../../hooks/usePublicItem";

const COMMENTS_BATCH_SIZE = 2;

function getImageUrl(image: string | null): string | null {
  if (!image) {
    return null;
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const normalizedPath = image.startsWith("/") ? image : `/${image}`;

  if (normalizedPath.startsWith("/media/")) {
    return `${API_BASE_URL}${normalizedPath}`;
  }

  return `${API_BASE_URL}/media${normalizedPath}`;
}

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

function getStatusLabel(status: string): string {
  switch (status) {
    case "approved":
      return "Approved";
    case "claimed":
      return "Claimed";
    default:
      return status
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
  }
}

function getTypeLabel(type: "lost" | "found"): string {
  return type === "lost" ? "Lost item" : "Found item";
}

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

function isNotFoundError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status?: unknown }).status === 404,
  );
}

export function ItemDetailsPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { accessToken, isAuthenticated, user } = useAuth();

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [commentActionError, setCommentActionError] = useState("");
  const [visibleCommentCount, setVisibleCommentCount] =
    useState(COMMENTS_BATCH_SIZE);
  const [isClaimSectionOpen, setIsClaimSectionOpen] = useState(false);
  const [isReportSectionOpen, setIsReportSectionOpen] = useState(false);
  const [isCommentsSectionOpen, setIsCommentsSectionOpen] = useState(false);

  const [claimReason, setClaimReason] = useState("");
  const [claimActionError, setClaimActionError] = useState("");

  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportActionError, setReportActionError] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const parsedItemId = itemId ? Number(itemId) : NaN;

  const validItemId =
    Number.isInteger(parsedItemId) && parsedItemId > 0 ? parsedItemId : null;

  const {
    data: item,
    isLoading: isItemLoading,
    isError: isItemError,
    error: itemError,
  } = usePublicItem(validItemId);

  const {
    data: comments = [],
    isLoading: areCommentsLoading,
    isError: areCommentsError,
    error: commentsError,
  } = useItemComments(validItemId);

  const { data: myClaims = [] } = useMyClaims(
    isAuthenticated && user?.is_verified ? accessToken : null,
  );

  const createCommentMutation = useCreateItemComment(validItemId, accessToken);

  const updateCommentMutation = useUpdateComment(validItemId, accessToken);

  const deleteCommentMutation = useDeleteComment(validItemId, accessToken);

  const createClaimMutation = useCreateClaim(accessToken);

  const createReportMutation = useCreateReport(accessToken);

  function handleSignIn() {
    navigate("/sign-in", {
      state: {
        from: location,
      },
    });
  }

  function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = commentText.trim();

    if (!content) {
      setCommentActionError("Write a comment before submitting.");
      return;
    }

    if (!isAuthenticated || !accessToken) {
      handleSignIn();
      return;
    }

    if (!user?.is_verified) {
      navigate("/verification-required");
      return;
    }

    setCommentActionError("");

    createCommentMutation.mutate(
      {
        payload: {
          content,
        },
      },
      {
        onSuccess: () => {
          setCommentText("");
        },
        onError: (error) => {
          setCommentActionError(getApiErrorMessage(error));
        },
      },
    );
  }

  function startEditingComment(commentId: number, content: string) {
    setCommentActionError("");
    setEditingCommentId(commentId);
    setEditingText(content);
  }

  function cancelEditingComment() {
    setEditingCommentId(null);
    setEditingText("");
  }

  function handleCommentUpdate(
    event: FormEvent<HTMLFormElement>,
    commentId: number,
  ) {
    event.preventDefault();

    const content = editingText.trim();

    if (!content) {
      setCommentActionError("A comment cannot be empty.");
      return;
    }

    if (!accessToken) {
      handleSignIn();
      return;
    }

    setCommentActionError("");

    updateCommentMutation.mutate(
      {
        commentId,
        payload: {
          content,
        },
      },
      {
        onSuccess: () => {
          cancelEditingComment();
        },
        onError: (error) => {
          setCommentActionError(getApiErrorMessage(error));
        },
      },
    );
  }

  function handleCommentDelete(commentId: number) {
    if (!accessToken) {
      handleSignIn();
      return;
    }

    const confirmed = window.confirm(
      "Delete this comment? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setCommentActionError("");

    deleteCommentMutation.mutate(
      {
        commentId,
      },
      {
        onSuccess: () => {
          if (editingCommentId === commentId) {
            cancelEditingComment();
          }
        },
        onError: (error) => {
          setCommentActionError(getApiErrorMessage(error));
        },
      },
    );
  }

  function handleClaimSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const reason = claimReason.trim();

    if (!reason || reason.length < 10) {
      setClaimActionError(
        "Explain why you believe this item belongs to you using at least 10 characters.",
      );
      return;
    }

    if (reason.length > 2000) {
      setClaimActionError("The claim reason cannot exceed 2000 characters.");
      return;
    }

    if (!isAuthenticated || !accessToken) {
      handleSignIn();
      return;
    }

    if (!user?.is_verified) {
      navigate("/verification-required");
      return;
    }

    if (!item) {
      return;
    }

    if (item.type !== "found") {
      setClaimActionError("Claims can only be submitted for found items.");
      return;
    }

    if (item.status !== "approved") {
      setClaimActionError("This item is not currently available for claims.");
      return;
    }

    if (item.user_id === user.id) {
      setClaimActionError("You cannot claim your own item.");
      return;
    }

    setClaimActionError("");

    createClaimMutation.mutate(
      {
        itemId: item.id,
        payload: {
          reason,
        },
      },
      {
        onSuccess: () => {
          setClaimReason("");
        },
        onError: (error) => {
          setClaimActionError(getApiErrorMessage(error));
        },
      },
    );
  }

  function handleReportSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const reason = reportReason.trim();
    const description = reportDescription.trim();

    if (!reason || reason.length < 3) {
      setReportActionError("Enter a report reason of at least 3 characters.");
      return;
    }

    if (reason.length > 100) {
      setReportActionError("The report reason cannot exceed 100 characters.");
      return;
    }

    if (!description || description.length < 10) {
      setReportActionError(
        "Provide at least 10 characters describing the issue.",
      );
      return;
    }

    if (description.length > 5000) {
      setReportActionError(
        "The report description cannot exceed 5000 characters.",
      );
      return;
    }

    if (!isAuthenticated || !accessToken) {
      handleSignIn();
      return;
    }

    if (!user?.is_verified) {
      navigate("/verification-required");
      return;
    }

    if (!item) {
      return;
    }

    if (item.user_id === user.id) {
      setReportActionError("You cannot report your own post.");
      return;
    }

    setReportActionError("");

    createReportMutation.mutate(
      {
        itemId: item.id,
        payload: {
          reason,
          description,
        },
      },
      {
        onSuccess: () => {
          setReportReason("");
          setReportDescription("");
          setReportSubmitted(true);
        },
        onError: (error) => {
          setReportActionError(getApiErrorMessage(error));
        },
      },
    );
  }

  if (isItemLoading) {
    return (
      <main className="min-h-[70vh] bg-[var(--trackit-surface)] px-5 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-6xl animate-pulse">
          <div className="h-5 w-24 rounded bg-[var(--trackit-surface-blue)]" />

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm">
              <div className="aspect-[4/3] bg-[var(--trackit-surface-blue)]" />

              <div className="space-y-4 p-6 sm:p-8">
                <div className="h-5 w-28 rounded bg-[var(--trackit-surface-blue)]" />
                <div className="h-9 w-3/4 rounded bg-[var(--trackit-surface-blue)]" />
                <div className="h-4 w-full rounded bg-[var(--trackit-surface-blue)]" />
                <div className="h-4 w-5/6 rounded bg-[var(--trackit-surface-blue)]" />
              </div>
            </div>

            <div className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8">
              <div className="h-6 w-32 rounded bg-[var(--trackit-surface-blue)]" />
              <div className="mt-6 h-16 rounded-2xl bg-[var(--trackit-surface-blue)]" />
              <div className="mt-4 h-16 rounded-2xl bg-[var(--trackit-surface-blue)]" />
              <div className="mt-4 h-16 rounded-2xl bg-[var(--trackit-surface-blue)]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (validItemId === null || isItemError || !item) {
    return (
      <main className="min-h-[70vh] bg-[var(--trackit-surface)] px-5 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-3xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold !text-[var(--trackit-blue)] transition hover:bg-[var(--trackit-blue-soft)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
          >
            ← Go back
          </button>

          <section
            role="alert"
            className="mt-8 rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-8 text-center shadow-sm sm:p-12"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--trackit-blue-soft)] text-2xl font-bold text-[var(--trackit-blue)]">
              ?
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-3xl">
              {isNotFoundError(itemError)
                ? "Item not found"
                : "We couldn't load this item"}
            </h1>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-[var(--trackit-text-muted)]">
              {isNotFoundError(itemError)
                ? "This item may no longer be publicly available."
                : getApiErrorMessage(itemError)}
            </p>

            <Link
              to="/discover"
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              Back to Discover
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const imageUrl = getImageUrl(item.image);

  const isCommentSubmitting = createCommentMutation.isPending;

  const isCommentUpdating = updateCommentMutation.isPending;

  const isCommentDeleting = deleteCommentMutation.isPending;

  const isClaimSubmitting = createClaimMutation.isPending;

  const isReportSubmitting = createReportMutation.isPending;

  const isOwnItem = Boolean(user && user.id === item.user_id);

  const myItemClaims = myClaims
    .filter((claim) => claim.item_id === item.id)
    .sort(
      (first, second) =>
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime(),
    );

  const approvedClaim =
    myItemClaims.find((claim) => claim.status === "approved") ?? null;

  const pendingClaim =
    myItemClaims.find((claim) => claim.status === "pending") ?? null;

  const activeClaim = approvedClaim ?? pendingClaim;

  const latestClaim = myItemClaims[0] ?? null;

  const canSubmitClaim =
    item.type === "found" &&
    item.status === "approved" &&
    !isOwnItem &&
    !activeClaim;

  const visibleComments = comments.slice(0, visibleCommentCount);

  const hasMoreComments = visibleCommentCount < comments.length;

  return (
    <main className="min-h-[70vh] bg-[var(--trackit-surface)] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-6xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold !text-[var(--trackit-blue)] transition hover:bg-[var(--trackit-blue-soft)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          ← Go back
        </button>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm">
            <div className="bg-[var(--trackit-deep-navy)]">
              {imageUrl ? (
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-[var(--trackit-deep-navy)] px-6 text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-[var(--trackit-blue-bright)]">
                      {item.type === "lost" ? "?" : "✓"}
                    </div>

                    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
                      No image provided
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex min-h-8 items-center rounded-full bg-[var(--trackit-blue-soft)] px-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--trackit-blue)]">
                  {getTypeLabel(item.type)}
                </span>

                <span className="inline-flex min-h-8 items-center rounded-full border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--trackit-navy)]">
                  {getStatusLabel(item.status)}
                </span>
              </div>

              <h1 className="mt-5 break-words text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                {item.title}
              </h1>

              <p className="mt-5 whitespace-pre-wrap leading-8 text-[var(--trackit-text-muted)]">
                {item.description}
              </p>

              <dl className="mt-8 grid gap-5 border-t border-[var(--trackit-border)] pt-8 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
                    Category
                  </dt>

                  <dd className="mt-1 break-words font-semibold text-[var(--trackit-navy)]">
                    {item.category}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
                    Location
                  </dt>

                  <dd className="mt-1 break-words font-semibold text-[var(--trackit-navy)]">
                    {item.location}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
                    Posted
                  </dt>

                  <dd className="mt-1 font-semibold text-[var(--trackit-navy)]">
                    {formatDate(item.created_at)}
                  </dd>
                </div>

                {item.updated_at !== item.created_at ? (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
                      Updated
                    </dt>

                    <dd className="mt-1 font-semibold text-[var(--trackit-navy)]">
                      {formatDate(item.updated_at)}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <section className="mt-8 border-t border-[var(--trackit-border)] pt-8">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                  Posted by
                </h2>

                <Link
                  to={`/users/${item.user_id}`}
                  className="mt-4 inline-flex min-h-12 items-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-sm font-bold !text-[var(--trackit-navy)] transition hover:border-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  View poster profile
                  <span className="ml-2 !text-[var(--trackit-blue)]">→</span>
                </Link>
              </section>
            </div>
          </article>

          <aside className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                About this post
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-[var(--trackit-navy)]">
                Help keep the return process clear.
              </h2>

              <p className="mt-4 leading-7 text-[var(--trackit-text-muted)]">
                If you recognize this item, use the information above and the
                conversation below to share useful details responsibly.
              </p>
            </div>

            {item.type === "found" &&
            !isOwnItem &&
            (item.status === "approved" || item.status === "claimed") ? (
              <section className="mt-7 rounded-2xl border border-[var(--trackit-blue)]/20 bg-[var(--trackit-blue-soft)] p-5">
                <button
                  type="button"
                  onClick={() => setIsClaimSectionOpen((open) => !open)}
                  aria-expanded={isClaimSectionOpen}
                  className="flex min-h-11 w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                      Found item
                    </span>

                    <span className="mt-1 block text-lg font-extrabold text-[var(--trackit-navy)]">
                      {item.status === "claimed"
                        ? "This item has been claimed."
                        : activeClaim?.status === "approved"
                          ? "Your claim was approved."
                          : activeClaim?.status === "pending"
                            ? "Your claim is under review."
                            : latestClaim?.status === "rejected"
                              ? "Submit a new claim."
                              : latestClaim?.status === "withdrawn"
                                ? "Submit a new claim."
                                : "Is this your item?"}
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="shrink-0 text-xl font-bold text-[var(--trackit-blue)]"
                  >
                    {isClaimSectionOpen ? "−" : "+"}
                  </span>
                </button>

                {isClaimSectionOpen ? (
                  <div className="mt-5 border-t border-[var(--trackit-blue)]/20 pt-5">
                    {item.status === "claimed" ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
                        This found item is no longer available for new claims.
                      </p>
                    ) : activeClaim?.status === "approved" ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
                        Your claim has been approved by the TrackIt moderation
                        team.
                      </p>
                    ) : activeClaim?.status === "pending" ? (
                      <p className="mt-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
                        Your claim has been submitted and is waiting for
                        moderation.
                      </p>
                    ) : isAuthenticated && !user?.is_verified ? (
                      <>
                        <p className="mt-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
                          Verify your TrackIt account before submitting a claim.
                        </p>

                        <Link
                          to="/verification-required"
                          className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                        >
                          Verify your account
                        </Link>
                      </>
                    ) : !isAuthenticated ? (
                      <>
                        <p className="mt-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
                          Sign in to submit a claim for this found item.
                        </p>

                        <button
                          type="button"
                          onClick={handleSignIn}
                          className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                        >
                          Sign in to claim
                        </button>
                      </>
                    ) : canSubmitClaim ? (
                      <>
                        {latestClaim?.status === "rejected" ? (
                          <p className="mt-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
                            Your previous claim was rejected. You can submit a
                            new claim if you have additional information that
                            supports your claim.
                          </p>
                        ) : latestClaim?.status === "withdrawn" ? (
                          <p className="mt-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
                            Your previous claim was withdrawn. You can submit a
                            new claim if you still believe this item belongs to
                            you.
                          </p>
                        ) : (
                          <p className="mt-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
                            Provide information that can help the TrackIt
                            moderation team verify that this item belongs to
                            you.
                          </p>
                        )}

                        <form onSubmit={handleClaimSubmit} className="mt-5">
                          <label
                            htmlFor="claim-reason"
                            className="block text-sm font-bold text-[var(--trackit-navy)]"
                          >
                            {latestClaim?.status === "rejected"
                              ? "Additional claim information"
                              : "Why do you believe this item is yours?"}
                          </label>

                          <textarea
                            id="claim-reason"
                            name="reason"
                            value={claimReason}
                            onChange={(event) => {
                              setClaimReason(event.target.value);
                              setClaimActionError("");
                            }}
                            rows={6}
                            minLength={10}
                            maxLength={2000}
                            disabled={isClaimSubmitting}
                            placeholder={
                              latestClaim?.status === "rejected"
                                ? "Explain the information that supports your new claim."
                                : "Provide useful details that can help verify your claim."
                            }
                            className="mt-2 w-full resize-y rounded-xl border border-[var(--trackit-input-border)] bg-[var(--trackit-input-surface)] px-4 py-3 text-sm leading-6 text-[var(--trackit-text)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                          />

                          <div className="mt-2 flex items-center justify-between gap-3">
                            <p className="text-xs text-[var(--trackit-text-muted)]">
                              At least 10 characters.
                            </p>

                            <p className="text-xs text-[var(--trackit-text-muted)]">
                              {claimReason.length}/2000
                            </p>
                          </div>

                          {claimActionError ? (
                            <div
                              role="alert"
                              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                            >
                              {claimActionError}
                            </div>
                          ) : null}

                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={isClaimSubmitting}
                            disabled={
                              !claimReason.trim() ||
                              claimReason.trim().length < 10
                            }
                            fullWidth
                            className="mt-5 !text-white"
                          >
                            {isClaimSubmitting
                              ? "Submitting claim..."
                              : latestClaim?.status === "rejected" ||
                                  latestClaim?.status === "withdrawn"
                                ? "Submit new claim"
                                : "Claim this item"}
                          </Button>
                        </form>
                      </>
                    ) : null}
                  </div>
                ) : null}
              </section>
            ) : null}

            <div className="mt-7 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5">
              <p className="text-sm font-bold text-[var(--trackit-navy)]">
                Safety reminder
              </p>

              <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                Avoid posting passwords, financial information, exact private
                addresses, or other sensitive information in public comments.
              </p>
            </div>

            <Link
              to="/safety"
              className="mt-5 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold !text-[var(--trackit-blue)] transition hover:bg-[var(--trackit-blue-soft)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              Read TrackIt safety guidance →
            </Link>

            {!isOwnItem ? (
              <section className="mt-7 border-t border-[var(--trackit-border)] pt-7">
                <button
                  type="button"
                  onClick={() => setIsReportSectionOpen((open) => !open)}
                  aria-expanded={isReportSectionOpen}
                  className="flex min-h-11 w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                      Report this post
                    </span>

                    <span className="mt-1 block text-lg font-extrabold text-[var(--trackit-navy)]">
                      Something doesn't look right?
                    </span>
                  </span>

                  <span
                    aria-hidden="true"
                    className="shrink-0 text-xl font-bold text-[var(--trackit-blue)]"
                  >
                    {isReportSectionOpen ? "−" : "+"}
                  </span>
                </button>

                {isReportSectionOpen ? (
                  <div className="mt-5 border-t border-[var(--trackit-border)] pt-5">
                    <p className="text-sm leading-6 text-[var(--trackit-text-muted)]">
                      Report concerns about this post to the TrackIt
                      administrative team. Please provide clear, factual
                      information.
                    </p>

                    {reportSubmitted ? (
                      <div
                        role="status"
                        className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
                      >
                        <p className="font-bold text-emerald-900">
                          Report submitted
                        </p>

                        <p className="mt-2 text-sm leading-6 text-emerald-800">
                          Your report has been submitted for administrative
                          review. You can follow its status from My Reports.
                        </p>

                        <Link
                          to="/reports"
                          className="mt-4 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold !text-emerald-800 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        >
                          View my reports →
                        </Link>
                      </div>
                    ) : !isAuthenticated ? (
                      <div className="mt-5 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5">
                        <p className="font-bold text-[var(--trackit-navy)]">
                          Sign in to report a post
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                          You need a TrackIt account to submit and follow a
                          report.
                        </p>

                        <button
                          type="button"
                          onClick={handleSignIn}
                          className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                        >
                          Sign in to report
                        </button>
                      </div>
                    ) : !user?.is_verified ? (
                      <div className="mt-5 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5">
                        <p className="font-bold text-[var(--trackit-navy)]">
                          Verify your account to report
                        </p>

                        <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                          Your TrackIt account must be verified before you can
                          submit a report.
                        </p>

                        <Link
                          to="/verification-required"
                          className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                        >
                          Verify your account
                        </Link>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleReportSubmit}
                        className="mt-5 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5"
                      >
                        <div>
                          <label
                            htmlFor="report-reason"
                            className="block text-sm font-bold text-[var(--trackit-navy)]"
                          >
                            Reason
                          </label>

                          <input
                            id="report-reason"
                            name="reason"
                            type="text"
                            value={reportReason}
                            onChange={(event) => {
                              setReportReason(event.target.value);
                              setReportActionError("");
                            }}
                            maxLength={100}
                            disabled={isReportSubmitting}
                            placeholder="e.g. Misleading information"
                            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-sm text-[var(--trackit-navy)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                          />

                          <p className="mt-1 text-xs text-[var(--trackit-text-muted)]">
                            {reportReason.length}/100
                          </p>
                        </div>

                        <div className="mt-4">
                          <label
                            htmlFor="report-description"
                            className="block text-sm font-bold text-[var(--trackit-navy)]"
                          >
                            What is the concern?
                          </label>

                          <textarea
                            id="report-description"
                            name="description"
                            value={reportDescription}
                            onChange={(event) => {
                              setReportDescription(event.target.value);
                              setReportActionError("");
                            }}
                            rows={5}
                            maxLength={5000}
                            disabled={isReportSubmitting}
                            placeholder="Explain what you noticed and why you believe it needs administrative attention."
                            className="mt-2 w-full resize-y rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 py-3 text-sm leading-6 text-[var(--trackit-navy)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:opacity-60"
                          />

                          <p className="mt-1 text-xs text-[var(--trackit-text-muted)]">
                            {reportDescription.length}/5000
                          </p>
                        </div>

                        {reportActionError ? (
                          <div
                            role="alert"
                            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                          >
                            {reportActionError}
                          </div>
                        ) : null}

                        <div className="mt-5 flex flex-col gap-3">
                          <Button
                            type="submit"
                            variant="danger"
                            size="sm"
                            loading={isReportSubmitting}
                            disabled={
                              !reportReason.trim() || !reportDescription.trim()
                            }
                            fullWidth
                          >
                            {isReportSubmitting
                              ? "Submitting report..."
                              : "Submit report"}
                          </Button>

                          <p className="text-xs leading-5 text-[var(--trackit-text-muted)]">
                            Reports are reviewed through TrackIt's
                            administrative workflow. Submitting a report does
                            not automatically remove the post.
                          </p>
                        </div>
                      </form>
                    )}
                  </div>
                ) : null}
              </section>
            ) : null}
          </aside>
        </div>

        <section
          aria-labelledby="comments-heading"
          className="mt-8 rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] shadow-sm"
        >
          <div className="border-b border-[var(--trackit-border)] px-6 py-5 sm:px-8">
            <button
              type="button"
              onClick={() => setIsCommentsSectionOpen((open) => !open)}
              aria-expanded={isCommentsSectionOpen}
              aria-controls="comments-content"
              className="flex min-h-11 w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                  Community conversation
                </span>

                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    id="comments-heading"
                    className="text-xl font-extrabold text-[var(--trackit-navy)]"
                  >
                    Comments
                  </span>

                  {!areCommentsLoading && !areCommentsError ? (
                    <span className="text-sm text-[var(--trackit-text-muted)]">
                      {comments.length}{" "}
                      {comments.length === 1 ? "comment" : "comments"}
                    </span>
                  ) : null}
                </span>
              </span>

              <span
                aria-hidden="true"
                className="shrink-0 text-xl font-bold text-[var(--trackit-blue)]"
              >
                {isCommentsSectionOpen ? "−" : "+"}
              </span>
            </button>
          </div>

          {isCommentsSectionOpen ? (
            <div id="comments-content" className="p-6 sm:p-8">
              {isAuthenticated ? (
                user?.is_verified ? (
                  <form
                    onSubmit={handleCommentSubmit}
                    className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5"
                  >
                    <label
                      htmlFor="item-comment"
                      className="block text-sm font-bold text-[var(--trackit-navy)]"
                    >
                      Add a comment
                    </label>

                    <textarea
                      id="item-comment"
                      value={commentText}
                      onChange={(event) => {
                        setCommentText(event.target.value);
                        setCommentActionError("");
                      }}
                      rows={4}
                      maxLength={2000}
                      disabled={isCommentSubmitting}
                      placeholder="Share information that may help with this post..."
                      className="mt-3 w-full resize-y rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 py-3 text-sm leading-6 text-[var(--trackit-navy)] outline-none transition placeholder:text-[var(--trackit-text-muted)] focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-[var(--trackit-surface-blue)]"
                    />

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-[var(--trackit-text-muted)]">
                        Keep personal and sensitive information out of public
                        comments.
                      </p>

                      <button
                        type="submit"
                        disabled={isCommentSubmitting || !commentText.trim()}
                        className="min-h-11 rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isCommentSubmitting ? "Posting..." : "Post comment"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5">
                    <h3 className="font-bold text-[var(--trackit-navy)]">
                      Verify your email to comment
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                      Your account must be verified before you can participate
                      in item conversations.
                    </p>

                    <Link
                      to="/verification-required"
                      className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                    >
                      Verify your account
                    </Link>
                  </div>
                )
              ) : (
                <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5">
                  <h3 className="font-bold text-[var(--trackit-navy)]">
                    Want to join the conversation?
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    Sign in to share information that may help identify or
                    return this item.
                  </p>

                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    Sign in to comment
                  </button>
                </div>
              )}

              {commentActionError ? (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                >
                  {commentActionError}
                </div>
              ) : null}

              {areCommentsLoading ? (
                <div className="mt-8 space-y-5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-2xl border border-[var(--trackit-border)] p-5"
                    >
                      <div className="flex gap-3">
                        <div className="h-10 w-10 rounded-full bg-[var(--trackit-surface-blue)]" />

                        <div className="flex-1">
                          <div className="h-4 w-28 rounded bg-[var(--trackit-surface-blue)]" />
                          <div className="mt-3 h-4 w-full rounded bg-[var(--trackit-surface-blue)]" />
                          <div className="mt-2 h-4 w-4/5 rounded bg-[var(--trackit-surface-blue)]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : areCommentsError ? (
                <div
                  role="alert"
                  className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-6"
                >
                  <h3 className="font-bold text-red-900">
                    We couldn't load the comments
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-red-800">
                    {getApiErrorMessage(commentsError)}
                  </p>
                </div>
              ) : comments.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 py-8 text-center">
                  <h3 className="font-bold text-[var(--trackit-navy)]">
                    No comments yet
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    Be the first to share useful information about this post.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-8 space-y-5">
                    {visibleComments.map((comment) => {
                      const isOwner = user?.id === comment.user_id;

                      const isEditing = editingCommentId === comment.id;

                      const isDeleting =
                        isCommentDeleting &&
                        deleteCommentMutation.variables?.commentId ===
                          comment.id;

                      const commentProfilePath =
                        user?.id === comment.author.id
                          ? "/profile"
                          : `/users/${comment.author.id}`;

                      return (
                        <article
                          key={comment.id}
                          className="rounded-2xl border border-[var(--trackit-border)] p-5"
                        >
                          <div className="flex gap-3">
                            <Link
                              to={commentProfilePath}
                              aria-label={
                                user?.id === comment.author.id
                                  ? "View your profile"
                                  : `View ${comment.author.username}'s profile`
                              }
                              className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--trackit-blue-soft)] text-sm font-bold text-[var(--trackit-blue)] ring-offset-2 transition hover:ring-2 hover:ring-[var(--trackit-blue-bright)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                            >
                              {getImageUrl(comment.author.profile_picture) ? (
                                <img
                                  src={
                                    getImageUrl(
                                      comment.author.profile_picture,
                                    ) ?? undefined
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                getInitial(comment.author.username)
                              )}
                            </Link>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                                <Link
                                  to={commentProfilePath}
                                  className="break-words text-sm font-bold !text-[var(--trackit-navy)] hover:!text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                                >
                                  @{comment.author.username}
                                </Link>

                                <time
                                  dateTime={comment.created_at}
                                  className="text-xs text-[var(--trackit-text-muted)]"
                                >
                                  {formatDate(comment.created_at)}
                                </time>
                              </div>

                              {isEditing ? (
                                <form
                                  onSubmit={(event) =>
                                    handleCommentUpdate(event, comment.id)
                                  }
                                  className="mt-4"
                                >
                                  <label
                                    htmlFor={`edit-comment-${comment.id}`}
                                    className="sr-only"
                                  >
                                    Edit comment
                                  </label>

                                  <textarea
                                    id={`edit-comment-${comment.id}`}
                                    value={editingText}
                                    onChange={(event) => {
                                      setEditingText(event.target.value);
                                      setCommentActionError("");
                                    }}
                                    rows={4}
                                    maxLength={2000}
                                    disabled={isCommentUpdating}
                                    className="w-full resize-y rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 py-3 text-sm leading-6 text-[var(--trackit-navy)] outline-none focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-[var(--trackit-surface-blue)]"
                                  />

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                      type="submit"
                                      disabled={
                                        isCommentUpdating || !editingText.trim()
                                      }
                                      className="min-h-9 rounded-lg bg-[var(--trackit-blue)] px-4 text-xs font-bold text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      {isCommentUpdating
                                        ? "Saving..."
                                        : "Save changes"}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={cancelEditingComment}
                                      disabled={isCommentUpdating}
                                      className="min-h-9 rounded-lg border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-xs font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <>
                                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--trackit-text-muted)]">
                                    {comment.content}
                                  </p>

                                  {comment.updated_at !== comment.created_at ? (
                                    <p className="mt-2 text-xs text-[var(--trackit-text-muted)]">
                                      Edited
                                    </p>
                                  ) : null}

                                  {isOwner ? (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          startEditingComment(
                                            comment.id,
                                            comment.content,
                                          )
                                        }
                                        disabled={
                                          isCommentUpdating || isCommentDeleting
                                        }
                                        className="min-h-9 rounded-lg px-3 text-xs font-bold !text-[var(--trackit-blue)] transition hover:bg-[var(--trackit-blue-soft)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        Edit
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleCommentDelete(comment.id)
                                        }
                                        disabled={
                                          isCommentUpdating || isCommentDeleting
                                        }
                                        className="min-h-9 rounded-lg px-3 text-xs font-bold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                      >
                                        {isDeleting ? "Deleting..." : "Delete"}
                                      </button>
                                    </div>
                                  ) : null}
                                </>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {comments.length > COMMENTS_BATCH_SIZE ? (
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCommentCount((count) =>
                            count >= comments.length
                              ? COMMENTS_BATCH_SIZE
                              : Math.min(
                                  count + COMMENTS_BATCH_SIZE,
                                  comments.length,
                                ),
                          )
                        }
                        className="min-h-11 rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold !text-[var(--trackit-blue)] transition hover:bg-[var(--trackit-blue-soft)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                      >
                        {visibleCommentCount >= comments.length
                          ? "Show fewer comments"
                          : `Show ${Math.min(
                              visibleCommentCount + COMMENTS_BATCH_SIZE,
                              comments.length,
                            )} comments`}
                      </button>
                    </div>
                  ) : null}

                </>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
