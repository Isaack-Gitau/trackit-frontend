import { useState } from "react";
import { Link } from "react-router-dom";

import { getApiErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import {
  useDeleteAllNotifications,
  useDeleteNotification,
  useDeleteSelectedNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "../../hooks/useNotificationMutations";
import {
  useNotifications,
  useUnreadNotificationCount,
} from "../../hooks/useNotifications";

import type { Notification } from "../../types/notification";

function formatNotificationDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getNotificationTypeLabel(type: string): string {
  switch (type) {
    case "item_approved":
      return "Item update";
    case "item_rejected":
      return "Item update";
    case "claim_created":
      return "Claim update";
    case "claim_approved":
      return "Claim update";
    case "claim_rejected":
      return "Claim update";
    case "claim_withdrawn":
      return "Claim update";
    case "match_found":
      return "Potential match";
    default:
      return "Notification";
  }
}

function getNotificationTypeClasses(type: string): string {
  switch (type) {
    case "item_approved":
    case "claim_approved":
      return "bg-emerald-100 text-emerald-800";

    case "item_rejected":
    case "claim_rejected":
      return "bg-red-100 text-red-800";

    case "match_found":
      return "bg-amber-100 text-amber-800";

    case "claim_created":
    case "claim_withdrawn":
      return "bg-[var(--trackit-surface-blue)] text-[var(--trackit-blue)]";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function NotificationTypeIcon({
  type,
}: {
  type: string;
}) {
  if (
    type === "item_approved" ||
    type === "claim_approved"
  ) {
    return (
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
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (
    type === "item_rejected" ||
    type === "claim_rejected"
  ) {
    return (
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
        <circle cx="12" cy="12" r="9" />
        <path d="m9 9 6 6" />
        <path d="m15 9-6 6" />
      </svg>
    );
  }

  if (type === "match_found") {
    return (
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
        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
        <path d="M16 3h3a2 2 0 0 1 2 2v3" />
        <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        <path d="M8 8h8v8H8z" />
      </svg>
    );
  }

  if (
    type === "claim_created" ||
    type === "claim_withdrawn"
  ) {
    return (
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
        <path d="M7 4h10" />
        <path d="M7 8h10" />
        <path d="M7 12h6" />
        <path d="M5 3h14v18H5z" />
      </svg>
    );
  }

  return (
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
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function NotificationSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 sm:p-6">
      <div className="flex gap-4">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-[var(--trackit-blue-soft)]" />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-28 rounded bg-[var(--trackit-blue-soft)]" />
          <div className="h-5 w-3/4 rounded bg-[var(--trackit-blue-soft)]" />
          <div className="h-4 w-full rounded bg-[var(--trackit-blue-soft)]" />
          <div className="h-4 w-2/3 rounded bg-[var(--trackit-blue-soft)]" />
        </div>
      </div>
    </div>
  );
}

function NotificationRow({
  notification,
  selected,
  onToggleSelected,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  selected: boolean;
  onToggleSelected: (notificationId: number) => void;
  onMarkRead: (notificationId: number) => void;
  onDelete: (notification: Notification) => void;
}) {
  const isUnread = !notification.is_read;

  return (
    <article
      className={[
        "rounded-3xl border p-5 transition sm:p-6",
        isUnread
          ? "border-[var(--trackit-blue)]/30 bg-[var(--trackit-blue-soft)]/50 shadow-sm"
          : "border-[var(--trackit-border)] bg-[var(--trackit-surface)]",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className="flex shrink-0 items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() =>
              onToggleSelected(notification.id)
            }
            aria-label={`Select ${notification.title}`}
            className="h-4 w-4 rounded border-[var(--trackit-border)] text-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
          />

          <div
            className={[
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              isUnread
                ? "bg-[var(--trackit-blue)] text-white"
                : "bg-[var(--trackit-surface-blue)] text-[var(--trackit-blue)]",
            ].join(" ")}
          >
            <NotificationTypeIcon type={notification.type} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-bold",
                  getNotificationTypeClasses(
                    notification.type,
                  ),
                ].join(" ")}
              >
                {getNotificationTypeLabel(
                  notification.type,
                )}
              </span>

              {isUnread ? (
                <span className="rounded-full bg-[var(--trackit-blue)] px-3 py-1 text-xs font-bold !text-white">
                  Unread
                </span>
              ) : null}
            </div>

            <time
              dateTime={notification.created_at}
              className="shrink-0 text-xs text-[var(--trackit-text-muted)]"
            >
              {formatNotificationDate(
                notification.created_at,
              )}
            </time>
          </div>

          <h2 className="mt-3 text-lg font-extrabold tracking-tight text-[var(--trackit-navy)]">
            {notification.title}
          </h2>

          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[var(--trackit-text-muted)]">
            {notification.message}
          </p>

          <div className="mt-5 flex flex-col gap-2 border-t border-[var(--trackit-border)] pt-4 sm:flex-row sm:items-center">
            {isUnread ? (
              <button
                type="button"
                onClick={() =>
                  onMarkRead(notification.id)
                }
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                Mark as read
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => onDelete(notification)}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-4 text-sm font-bold text-[var(--trackit-danger-text)] transition hover:border-[var(--trackit-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function NotificationsPage() {
  const { accessToken } = useAuth();

  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useNotifications(accessToken);

  const {
    data: unreadCountData,
  } = useUnreadNotificationCount(accessToken);

  const markNotificationAsReadMutation =
    useMarkNotificationAsRead(accessToken);

  const markAllNotificationsAsReadMutation =
    useMarkAllNotificationsAsRead(accessToken);

  const deleteNotificationMutation =
    useDeleteNotification(accessToken);

  const deleteSelectedNotificationsMutation =
    useDeleteSelectedNotifications(accessToken);

  const deleteAllNotificationsMutation =
    useDeleteAllNotifications(accessToken);

  const [selectedNotificationIds, setSelectedNotificationIds] =
    useState<Set<number>>(new Set());

  const [notificationPendingDeletion, setNotificationPendingDeletion] =
    useState<Notification | null>(null);

  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] =
    useState(false);

  const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] =
    useState(false);

  const selectedCount = selectedNotificationIds.size;

  const allNotificationsSelected =
    notifications.length > 0 &&
    notifications.every((notification) =>
      selectedNotificationIds.has(notification.id),
    );

  const unreadCount =
    unreadCountData?.unread_count ??
    notifications.filter(
      (notification) => !notification.is_read,
    ).length;



  function toggleNotificationSelection(
    notificationId: number,
  ) {
    setSelectedNotificationIds((current) => {
      const next = new Set(current);

      if (next.has(notificationId)) {
        next.delete(notificationId);
      } else {
        next.add(notificationId);
      }

      return next;
    });
  }

  function toggleSelectAll() {
    if (allNotificationsSelected) {
      setSelectedNotificationIds(new Set());
      return;
    }

    setSelectedNotificationIds(
      new Set(notifications.map((notification) => notification.id)),
    );
  }

  function handleMarkRead(notificationId: number) {
    markNotificationAsReadMutation.mutate({
      notificationId,
    });
  }

  function handleMarkAllAsRead() {
    markAllNotificationsAsReadMutation.mutate({});
  }

  function openDeleteNotificationConfirmation(
    notification: Notification,
  ) {
    deleteNotificationMutation.reset();
    setNotificationPendingDeletion(notification);
  }

  function closeDeleteNotificationConfirmation() {
    if (deleteNotificationMutation.isPending) {
      return;
    }

    deleteNotificationMutation.reset();
    setNotificationPendingDeletion(null);
  }

  function handleDeleteNotification() {
    if (!notificationPendingDeletion) {
      return;
    }

    deleteNotificationMutation.mutate(
      {
        notificationId: notificationPendingDeletion.id,
      },
      {
        onSuccess: () => {
          setSelectedNotificationIds((current) => {
            const next = new Set(current);
            next.delete(notificationPendingDeletion.id);
            return next;
          });

          setNotificationPendingDeletion(null);
          deleteNotificationMutation.reset();
        },
      },
    );
  }

  function handleDeleteSelected() {
    if (selectedCount === 0) {
      return;
    }

    deleteSelectedNotificationsMutation.mutate(
      {
        payload: {
          notification_ids: [...selectedNotificationIds],
        },
      },
      {
        onSuccess: () => {
          setSelectedNotificationIds(new Set());
          setIsDeleteSelectedDialogOpen(false);
          deleteSelectedNotificationsMutation.reset();
        },
      },
    );
  }

  function handleDeleteAll() {
    deleteAllNotificationsMutation.mutate(
      {},
      {
        onSuccess: () => {
          setSelectedNotificationIds(new Set());
          setIsDeleteAllDialogOpen(false);
          deleteAllNotificationsMutation.reset();
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
                Stay informed
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl lg:text-5xl">
                Notifications
              </h1>

              <p className="mt-4 text-base leading-7 text-[var(--trackit-text-muted)] sm:text-lg">
                Keep up with your item posts, claims, potential
                matches, and other important TrackIt activity.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="notifications-results-heading"
            className="mt-12"
          >
            <div className="flex flex-col gap-5 border-b border-[var(--trackit-border)] pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Activity
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2
                    id="notifications-results-heading"
                    className="text-3xl font-extrabold text-[var(--trackit-navy)]"
                  >
                    Your notifications
                  </h2>

                  {!isLoading && !isError ? (
                    <span className="rounded-full bg-[var(--trackit-surface-blue)] px-3 py-1 text-sm font-bold text-[var(--trackit-blue)]">
                      {unreadCount} unread
                    </span>
                  ) : null}
                </div>
              </div>

              {!isLoading && !isError && notifications.length > 0 ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                  >
                    {allNotificationsSelected
                      ? "Clear selection"
                      : "Select all"}
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    disabled={
                      unreadCount === 0 ||
                      markAllNotificationsAsReadMutation.isPending
                    }
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-4 text-sm font-bold !text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {markAllNotificationsAsReadMutation.isPending ? (
                      <>
                        <span
                          aria-hidden="true"
                          className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        />
                        Marking...
                      </>
                    ) : (
                      "Mark all as read"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setIsDeleteAllDialogOpen(true)
                    }
                    disabled={
                      deleteAllNotificationsMutation.isPending
                    }
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-danger-border)] bg-[var(--trackit-danger-soft)] px-4 text-sm font-bold text-[var(--trackit-danger-text)] transition hover:border-[var(--trackit-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete all
                  </button>
                </div>
              ) : null}
            </div>

            {selectedCount > 0 &&
            !isLoading &&
            !isError ? (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[var(--trackit-blue)]/20 bg-[var(--trackit-blue-soft)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-[var(--trackit-navy)]">
                  {selectedCount}{" "}
                  {selectedCount === 1
                    ? "notification"
                    : "notifications"}{" "}
                  selected
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setIsDeleteSelectedDialogOpen(true)
                  }
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--trackit-danger)] px-4 text-sm font-bold !text-white transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30"
                >
                  Delete selected
                </button>
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-7 space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <NotificationSkeleton key={index} />
                ))}
              </div>
            ) : isError ? (
              <div
                role="alert"
                className="mt-7 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center"
              >
                <h3 className="text-lg font-bold text-red-900">
                  We couldn't load your notifications
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
            ) : notifications.length === 0 ? (
              <div className="mt-7 rounded-3xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]">
                  <NotificationTypeIcon type="system" />
                </div>

                <h3 className="mt-6 text-xl font-extrabold text-[var(--trackit-navy)]">
                  You're all caught up
                </h3>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-[var(--trackit-text-muted)]">
                  New activity such as claim updates and potential
                  matches will appear here when TrackIt has something
                  important to share with you.
                </p>

                <Link
                  to="/discover"
                  className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Discover posts
                </Link>
              </div>
            ) : (
              <div className="mt-7 space-y-4">
                {notifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    selected={selectedNotificationIds.has(
                      notification.id,
                    )}
                    onToggleSelected={
                      toggleNotificationSelection
                    }
                    onMarkRead={handleMarkRead}
                    onDelete={
                      openDeleteNotificationConfirmation
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {notificationPendingDeletion ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteNotificationConfirmation();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-notification-dialog-title"
            aria-describedby="delete-notification-dialog-description"
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
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="m6 7 1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
              </svg>
            </div>

            <h2
              id="delete-notification-dialog-title"
              className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--trackit-navy)]"
            >
              Delete this notification?
            </h2>

            <p
              id="delete-notification-dialog-description"
              className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]"
            >
              You are about to permanently remove{" "}
              <span className="font-bold text-[var(--trackit-navy)]">
                “{notificationPendingDeletion.title}”
              </span>
              .
            </p>

            {deleteNotificationMutation.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(
                  deleteNotificationMutation.error,
                )}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteNotificationConfirmation}
                disabled={deleteNotificationMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteNotification}
                disabled={deleteNotificationMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-danger)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteNotificationMutation.isPending ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete notification"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteSelectedDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              if (
                !deleteSelectedNotificationsMutation.isPending
              ) {
                deleteSelectedNotificationsMutation.reset();
                setIsDeleteSelectedDialogOpen(false);
              }
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-selected-dialog-title"
            aria-describedby="delete-selected-dialog-description"
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
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="m6 7 1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
              </svg>
            </div>

            <h2
              id="delete-selected-dialog-title"
              className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--trackit-navy)]"
            >
              Delete selected notifications?
            </h2>

            <p
              id="delete-selected-dialog-description"
              className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]"
            >
              You selected{" "}
              <span className="font-bold text-[var(--trackit-navy)]">
                {selectedCount}{" "}
                {selectedCount === 1
                  ? "notification"
                  : "notifications"}
              </span>
              . These notifications will be permanently removed.
            </p>

            {deleteSelectedNotificationsMutation.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(
                  deleteSelectedNotificationsMutation.error,
                )}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (
                    deleteSelectedNotificationsMutation.isPending
                  ) {
                    return;
                  }

                  deleteSelectedNotificationsMutation.reset();
                  setIsDeleteSelectedDialogOpen(false);
                }}
                disabled={
                  deleteSelectedNotificationsMutation.isPending
                }
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={
                  deleteSelectedNotificationsMutation.isPending
                }
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-danger)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteSelectedNotificationsMutation.isPending ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete selected"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteAllDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-8"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              if (
                !deleteAllNotificationsMutation.isPending
              ) {
                deleteAllNotificationsMutation.reset();
                setIsDeleteAllDialogOpen(false);
              }
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-all-dialog-title"
            aria-describedby="delete-all-dialog-description"
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
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="m6 7 1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
              </svg>
            </div>

            <h2
              id="delete-all-dialog-title"
              className="mt-5 text-2xl font-extrabold tracking-tight text-[var(--trackit-navy)]"
            >
              Delete all notifications?
            </h2>

            <p
              id="delete-all-dialog-description"
              className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]"
            >
              This will permanently remove all of your TrackIt
              notifications. This action cannot be undone.
            </p>

            {deleteAllNotificationsMutation.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {getApiErrorMessage(
                  deleteAllNotificationsMutation.error,
                )}
              </div>
            ) : null}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (
                    deleteAllNotificationsMutation.isPending
                  ) {
                    return;
                  }

                  deleteAllNotificationsMutation.reset();
                  setIsDeleteAllDialogOpen(false);
                }}
                disabled={deleteAllNotificationsMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={deleteAllNotificationsMutation.isPending}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-danger)] px-5 text-sm font-bold !text-white shadow-sm transition hover:bg-[var(--trackit-danger-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-danger)]/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteAllNotificationsMutation.isPending ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Deleting...
                  </>
                ) : (
                  "Delete all"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}