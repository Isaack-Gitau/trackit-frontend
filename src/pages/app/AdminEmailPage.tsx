import {
  useEffect,
  useState,
} from "react";

import { getApiErrorMessage } from "../../api/errors";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import {
  useAdminUsers,
  useSendAdminEmail,
} from "../../hooks/useAdmin";

import type {
  AdminAccountStatus,
  AdminEmailResponse,
  AdminUserListItem,
  AdminUserRole,
} from "../../types/admin";

const PAGE_SIZE = 10;

const SUBJECT_MIN_LENGTH = 1;
const SUBJECT_MAX_LENGTH = 200;

const MESSAGE_MIN_LENGTH = 1;
const MESSAGE_MAX_LENGTH = 10_000;

const MAX_RECIPIENTS = 50;

type RoleFilter = "all" | AdminUserRole;
type StatusFilter = "all" | AdminAccountStatus;

function formatName(user: AdminUserListItem): string {
  const name = `${user.first_name} ${user.last_name}`.trim();

  return name || user.username;
}

function getRoleLabel(role: AdminUserRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "moderator":
      return "Moderator";
    default:
      return "User";
  }
}

function getRoleClasses(role: AdminUserRole): string {
  switch (role) {
    case "admin":
      return "bg-[var(--trackit-blue-soft)] text-[var(--trackit-navy)]";
    case "moderator":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getApiMessage(error: unknown): string {
  return getApiErrorMessage(error);
}

function formatDeliveryError(error: string | null): string {
  if (!error) {
    return "Delivery failed without a specific error message.";
  }

  return error;
}

function RecipientRow({
  user,
  selected,
  disabled,
  onToggle,
}: {
  user: AdminUserListItem;
  selected: boolean;
  disabled: boolean;
  onToggle: (user: AdminUserListItem) => void;
}) {
  return (
    <label
      className={[
        "flex cursor-pointer items-start gap-3 rounded-xl border p-4",
        "transition-colors duration-200",
        selected
          ? "border-[var(--trackit-blue)] bg-[var(--trackit-blue-soft)]"
          : "border-[var(--trackit-border)] bg-[var(--trackit-surface)]",
        disabled && !selected
          ? "cursor-not-allowed opacity-60"
          : "hover:border-[var(--trackit-blue)]",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={() => onToggle(user)}
        className="mt-1 h-4 w-4 rounded border-[var(--trackit-border)] text-[var(--trackit-blue)] focus:ring-[var(--trackit-blue)]"
      />

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-[var(--trackit-text)]">
            {user.username}
          </span>

          <span
            className={[
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              getRoleClasses(user.role),
            ].join(" ")}
          >
            {getRoleLabel(user.role)}
          </span>

          {!user.is_active ? (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
              Inactive
            </span>
          ) : null}
        </span>

        <span className="mt-1 block text-sm text-[var(--trackit-text-muted)]">
          {formatName(user)}
        </span>

        <span className="mt-1 block break-all text-sm text-[var(--trackit-text-muted)]">
          {user.email}
        </span>
      </span>
    </label>
  );
}

function DeliveryResults({
  response,
  usersById,
}: {
  response: AdminEmailResponse;
  usersById: Map<number, AdminUserListItem>;
}) {
  return (
    <section
      aria-labelledby="delivery-results-heading"
      className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--trackit-blue)]">
            Delivery report
          </p>

          <h2
            id="delivery-results-heading"
            className="mt-1 text-xl font-bold text-[var(--trackit-navy)]"
          >
            Email delivery results
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
            Total: {response.total}
          </span>

          <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-800">
            Sent: {response.sent}
          </span>

          <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-800">
            Failed: {response.failed}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {response.results.map((result) => {
          const user = usersById.get(result.user_id);

          return (
            <div
              key={result.user_id}
              className="rounded-xl border border-[var(--trackit-border)] p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--trackit-text)]">
                    {user?.username ?? `User #${result.user_id}`}
                  </p>

                  {user ? (
                    <p className="text-sm text-[var(--trackit-text-muted)]">
                      {user.email}
                    </p>
                  ) : null}
                </div>

                <span
                  className={[
                    "w-fit rounded-full px-2.5 py-1 text-xs font-semibold",
                    result.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800",
                  ].join(" ")}
                >
                  {result.success ? "Sent" : "Failed"}
                </span>
              </div>

              {!result.success ? (
                <p className="mt-2 text-sm leading-6 text-red-800">
                  {formatDeliveryError(result.error)}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AdminEmailPage() {
  const { accessToken } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState<RoleFilter>("all");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("active");

  const [page, setPage] = useState(1);

  const [selectedUsersById, setSelectedUsersById] =
    useState<Map<number, AdminUserListItem>>(new Map());

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [deliveryResponse, setDeliveryResponse] =
    useState<AdminEmailResponse | null>(null);

  const [formError, setFormError] = useState("");

  const usersQuery = useAdminUsers(
    {
      search,
      role:
        roleFilter === "all"
          ? undefined
          : roleFilter,
      status:
        statusFilter === "all"
          ? undefined
          : statusFilter,
      page,
      limit: PAGE_SIZE,
    },
    accessToken,
  );

  const sendEmailMutation =
    useSendAdminEmail(accessToken);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const response = usersQuery.data;
  const users = response?.items ?? [];
  const totalPages = response?.pages ?? 1;

  const subjectLength = subject.trim().length;
  const messageLength = message.trim().length;

  const selectedUserIds = Array.from(
    selectedUsersById.keys(),
  );

  const recipientCount = selectedUsersById.size;

  const canSend =
    recipientCount >= 1 &&
    recipientCount <= MAX_RECIPIENTS &&
    subjectLength >= SUBJECT_MIN_LENGTH &&
    subjectLength <= SUBJECT_MAX_LENGTH &&
    messageLength >= MESSAGE_MIN_LENGTH &&
    messageLength <= MESSAGE_MAX_LENGTH &&
    !sendEmailMutation.isPending;

  function toggleUser(user: AdminUserListItem) {
    setFormError("");
    setDeliveryResponse(null);

    setSelectedUsersById((current) => {
      const next = new Map(current);

      if (next.has(user.id)) {
        next.delete(user.id);
        return next;
      }

      if (next.size >= MAX_RECIPIENTS) {
        return next;
      }

      next.set(user.id, user);
      return next;
    });
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("active");
    setPage(1);
  }

  function validateForm(): string | null {
    if (recipientCount < 1) {
      return "Select at least one recipient.";
    }

    if (recipientCount > MAX_RECIPIENTS) {
      return `You can select up to ${MAX_RECIPIENTS} recipients per email.`;
    }

    if (
      subjectLength < SUBJECT_MIN_LENGTH ||
      subjectLength > SUBJECT_MAX_LENGTH
    ) {
      return `Subject must be between ${SUBJECT_MIN_LENGTH} and ${SUBJECT_MAX_LENGTH} characters.`;
    }

    if (
      messageLength < MESSAGE_MIN_LENGTH ||
      messageLength > MESSAGE_MAX_LENGTH
    ) {
      return `Message must be between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters.`;
    }

    return null;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError("");
    setDeliveryResponse(null);

    sendEmailMutation.mutate(
      {
        payload: {
          user_ids: selectedUserIds,
          subject: subject.trim(),
          message: message.trim(),
        },
      },
      {
        onSuccess: (result) => {
          setDeliveryResponse(result);
        },
      },
    );
  }

  const hasFilters =
    Boolean(search) ||
    roleFilter !== "all" ||
    statusFilter !== "active";

  const firstItemNumber =
    response && response.total > 0
      ? (response.page - 1) * response.limit + 1
      : 0;

  const lastItemNumber =
    response && response.total > 0
      ? Math.min(
          response.page * response.limit,
          response.total,
        )
      : 0;

  return (
    <div className="min-h-screen bg-[var(--trackit-surface)]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
            Administration
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
            Email users
          </h1>

          <p className="mt-3 text-base leading-7 text-[var(--trackit-text-muted)]">
            Send a custom message to selected TrackIt users using
            their registered email addresses.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section
            aria-labelledby="recipients-heading"
            className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--trackit-blue)]">
                  Recipients
                </p>

                <h2
                  id="recipients-heading"
                  className="mt-1 text-xl font-bold text-[var(--trackit-navy)]"
                >
                  Select users
                </h2>
              </div>

              <div
                aria-live="polite"
                className="w-fit rounded-full bg-[var(--trackit-blue-soft)] px-3 py-1.5 text-sm font-semibold text-[var(--trackit-navy)]"
              >
                {recipientCount} / {MAX_RECIPIENTS} selected
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_160px]">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--trackit-text)]">
                  Search
                </span>

                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Username, name, or email"
                  className="min-h-11 w-full rounded-lg border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--trackit-text)]">
                  Role
                </span>

                <select
                  value={roleFilter}
                  onChange={(event) => {
                    setRoleFilter(
                      event.target.value as RoleFilter,
                    );
                    setPage(1);
                  }}
                  className="min-h-11 w-full rounded-lg border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                >
                  <option value="all">All roles</option>
                  <option value="user">Users</option>
                  <option value="moderator">Moderators</option>
                  <option value="admin">Admins</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--trackit-text)]">
                  Status
                </span>

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as StatusFilter,
                    );
                    setPage(1);
                  }}
                  className="min-h-11 w-full rounded-lg border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="all">All statuses</option>
                </select>
              </label>
            </div>

            {hasFilters ? (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              </div>
            ) : null}

            {usersQuery.isLoading ? (
              <div className="mt-5 space-y-3" aria-label="Loading users">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-xl bg-[var(--trackit-surface-raised)]"
                  />
                ))}
              </div>
            ) : usersQuery.isError ? (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
              >
                {getApiMessage(usersQuery.error)}
              </div>
            ) : users.length === 0 ? (
              <div className="mt-5 rounded-xl border border-dashed border-[var(--trackit-border)] p-8 text-center">
                <p className="font-semibold text-[var(--trackit-text)]">
                  No users found
                </p>

                <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-muted)]">
                  Try changing the search or recipient filters.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-5 space-y-3">
                  {users.map((user) => {
                    const selected = selectedUsersById.has(
                      user.id,
                    );

                    const selectionLimitReached =
                      recipientCount >= MAX_RECIPIENTS &&
                      !selected;

                    return (
                      <RecipientRow
                        key={user.id}
                        user={user}
                        selected={selected}
                        disabled={selectionLimitReached}
                        onToggle={toggleUser}
                      />
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-[var(--trackit-border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-[var(--trackit-text-muted)]">
                    Showing {firstItemNumber}–{lastItemNumber} of{" "}
                    {response?.total ?? 0} users.
                  </p>

                  {totalPages > 1 ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          page <= 1 ||
                          usersQuery.isFetching
                        }
                        onClick={() =>
                          setPage((current) =>
                            Math.max(1, current - 1),
                          )
                        }
                      >
                        Previous
                      </Button>

                      <span className="min-w-20 text-center text-sm font-semibold text-[var(--trackit-text)]">
                        Page {page} of {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          page >= totalPages ||
                          usersQuery.isFetching
                        }
                        onClick={() =>
                          setPage((current) =>
                            Math.min(
                              totalPages,
                              current + 1,
                            ),
                          )
                        }
                      >
                        Next
                      </Button>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </section>

          <form
            onSubmit={handleSubmit}
            className="h-fit rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm sm:p-6 lg:sticky lg:top-24"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--trackit-blue)]">
              Message
            </p>

            <h2 className="mt-1 text-xl font-bold text-[var(--trackit-navy)]">
              Compose email
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
              The message will be sent individually to each selected
              user's registered email address.
            </p>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--trackit-text)]">
                  Subject
                </span>

                <input
                  type="text"
                  value={subject}
                  maxLength={SUBJECT_MAX_LENGTH}
                  onChange={(event) => {
                    setSubject(event.target.value);
                    setFormError("");
                    setDeliveryResponse(null);
                  }}
                  placeholder="Email subject"
                  className="min-h-11 w-full rounded-lg border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3.5 text-sm text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                />

                <span className="mt-1.5 block text-right text-xs text-[var(--trackit-text-muted)]">
                  {subjectLength} / {SUBJECT_MAX_LENGTH}
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[var(--trackit-text)]">
                  Message
                </span>

                <textarea
                  value={message}
                  maxLength={MESSAGE_MAX_LENGTH}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setFormError("");
                    setDeliveryResponse(null);
                  }}
                  placeholder="Write your message..."
                  rows={12}
                  className="w-full resize-y rounded-lg border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-3.5 py-3 text-sm leading-6 text-[var(--trackit-text)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20"
                />

                <span className="mt-1.5 block text-right text-xs text-[var(--trackit-text-muted)]">
                  {messageLength} / {MESSAGE_MAX_LENGTH}
                </span>
              </label>

              {formError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
                >
                  {formError}
                </div>
              ) : null}

              {sendEmailMutation.isError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"
                >
                  {getApiMessage(sendEmailMutation.error)}
                </div>
              ) : null}

              <div className="rounded-xl bg-[var(--trackit-blue-soft)] p-4">
                <p className="text-sm font-semibold text-[var(--trackit-navy)]">
                  {recipientCount} recipient
                  {recipientCount === 1 ? "" : "s"} selected
                </p>

                <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-muted)]">
                  Inactive accounts may still receive email. Only
                  registered TrackIt email addresses can be used.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={sendEmailMutation.isPending}
                disabled={!canSend}
              >
                Send email
              </Button>
            </div>
          </form>
        </div>

        {deliveryResponse ? (
          <div className="mt-6">
            <DeliveryResults
              response={deliveryResponse}
              usersById={selectedUsersById}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}