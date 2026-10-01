import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { getApiErrorMessage } from "../../api/errors";
import {
  useAdminUsers,
} from "../../hooks/useAdmin";
import type {
  AdminAccountStatus,
  AdminUserRole,
} from "../../types/admin";
import { useAuth } from "../../context/AuthContext";

const PAGE_SIZE = 20;

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

function roleLabel(role: AdminUserRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "moderator":
      return "Moderator";
    default:
      return "User";
  }
}

function roleClasses(role: AdminUserRole): string {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-800";
    case "moderator":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function statusClasses(isActive: boolean): string {
  return isActive
    ? "bg-emerald-100 text-emerald-800"
    : "bg-red-100 text-red-800";
}

function VerificationBadge({
  verified,
}: {
  verified: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-1",
        "text-xs font-semibold",
        verified
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600",
      ].join(" ")}
    >
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

function UserIdentity({
  username,
  firstName,
  lastName,
  email,
}: {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}) {
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-[var(--trackit-text)]">
        {username}
      </p>

      <p className="truncate text-sm text-[var(--trackit-muted)]">
        {fullName || "No name provided"}
      </p>

      <p className="truncate text-sm text-[var(--trackit-muted)]">
        {email}
      </p>
    </div>
  );
}

export function AdminUsersPage() {
  const { accessToken } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AdminUserRole | "">("");
  const [status, setStatus] = useState<AdminAccountStatus | "">("");
  const [page, setPage] = useState(1);
  const [successMessage] =
    useState<string | null>(() =>
      typeof location.state?.successMessage === "string"
        ? location.state.successMessage
        : null,
    );

  useEffect(() => {
    if (!location.state?.successMessage) {
      return;
    }

    navigate(location.pathname + location.search, {
      replace: true,
      state: null,
    });
  }, [
    location.pathname,
    location.search,
    navigate,
  ]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextSearch = searchInput.trim();

      setSearch((currentSearch) =>
        currentSearch === nextSearch ? currentSearch : nextSearch,
      );

      setPage(1);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  const query = useAdminUsers(
    {
      search: search || undefined,
      role: role || undefined,
      status: status || undefined,
      page,
      limit: PAGE_SIZE,
    },
    accessToken,
  );

  const users = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = query.data?.pages ?? 1;
  const currentPage = query.data?.page ?? page;

  function handleRoleChange(
    nextRole: AdminUserRole | "",
  ) {
    setRole(nextRole);
    setPage(1);
  }

  function handleStatusChange(
    nextStatus: AdminAccountStatus | "",
  ) {
    setStatus(nextStatus);
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  }

  const hasFilters =
    Boolean(searchInput.trim()) ||
    Boolean(role) ||
    Boolean(status);

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-[var(--trackit-surface)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
            Administration
          </p>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Users
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--trackit-muted)]">
                Search and review TrackIt accounts, roles, verification
                status, and account activity.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
                Accounts
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--trackit-navy)]">
                {query.isLoading ? "—" : total}
              </p>
            </div>
          </div>
        </header>

        {successMessage ? (
          <div
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              {successMessage}
            </p>
          </div>
        ) : null}

        <div className="mb-6 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--trackit-navy)]">
                Search users
              </span>

              <input
                type="search"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Username, name, or email"
                className={[
                  "min-h-11 w-full rounded-lg border px-3.5",
                  "border-[var(--trackit-border)]",
                  "bg-[var(--trackit-surface)]",
                  "text-[var(--trackit-text)]",
                  "placeholder:text-[var(--trackit-muted)]",
                  "focus:border-[var(--trackit-blue)]",
                  "focus:outline-none focus:ring-2",
                  "focus:ring-[var(--trackit-blue)]/20",
                ].join(" ")}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--trackit-navy)]">
                Role
              </span>

              <select
                value={role}
                onChange={(event) =>
                  handleRoleChange(
                    event.target.value as AdminUserRole | "",
                  )
                }
                className={[
                  "min-h-11 w-full rounded-lg border px-3.5",
                  "border-[var(--trackit-border)]",
                  "bg-[var(--trackit-surface)]",
                  "text-[var(--trackit-text)]",
                  "focus:border-[var(--trackit-blue)]",
                  "focus:outline-none focus:ring-2",
                  "focus:ring-[var(--trackit-blue)]/20",
                ].join(" ")}
              >
                <option value="">All roles</option>
                <option value="user">Users</option>
                <option value="moderator">Moderators</option>
                <option value="admin">Administrators</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--trackit-navy)]">
                Account status
              </span>

              <select
                value={status}
                onChange={(event) =>
                  handleStatusChange(
                    event.target.value as AdminAccountStatus | "",
                  )
                }
                className={[
                  "min-h-11 w-full rounded-lg border px-3.5",
                  "border-[var(--trackit-border)]",
                  "bg-[var(--trackit-surface)]",
                  "text-[var(--trackit-text)]",
                  "focus:border-[var(--trackit-blue)]",
                  "focus:outline-none focus:ring-2",
                  "focus:ring-[var(--trackit-blue)]/20",
                ].join(" ")}
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <Button
              variant="outline"
              size="md"
              onClick={resetFilters}
              disabled={!hasFilters}
              className="w-full lg:w-auto"
            >
              Reset
            </Button>
          </div>
        </div>

        {query.isLoading ? (
          <div
            className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--trackit-blue)] border-r-transparent" />
            <p className="mt-4 font-semibold text-[var(--trackit-navy)]">
              Loading users…
            </p>
          </div>
        ) : query.isError ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50 p-6"
            role="alert"
          >
            <h2 className="font-semibold text-red-900">
              Users could not be loaded
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-800">
              {getApiErrorMessage(query.error)}
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void query.refetch();
              }}
              className="mt-4 !border-red-300 !text-red-800 hover:!border-red-400 hover:!text-red-900"
            >
              Try again
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]">
              <span aria-hidden="true" className="text-xl">
                ?
              </span>
            </div>

            <h2 className="mt-4 text-xl font-bold text-[var(--trackit-navy)]">
              No users found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--trackit-muted)]">
              No accounts match the current search and filter settings.
            </p>

            {hasFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mt-5"
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-[var(--trackit-border)] bg-[var(--trackit-blue-soft)]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--trackit-navy)]">
                        User
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--trackit-navy)]">
                        Role
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--trackit-navy)]">
                        Status
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--trackit-navy)]">
                        Verification
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[var(--trackit-navy)]">
                        Created
                      </th>
                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-[var(--trackit-navy)]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--trackit-border)]">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors hover:bg-[var(--trackit-blue-soft)]/40"
                      >
                        <td className="px-5 py-4">
                          <UserIdentity
                            username={user.username}
                            firstName={user.first_name}
                            lastName={user.last_name}
                            email={user.email}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1",
                              "text-xs font-semibold",
                              roleClasses(user.role),
                            ].join(" ")}
                          >
                            {roleLabel(user.role)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={[
                              "inline-flex rounded-full px-2.5 py-1",
                              "text-xs font-semibold",
                              statusClasses(user.is_active),
                            ].join(" ")}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <VerificationBadge
                            verified={user.is_verified}
                          />
                        </td>

                        <td className="px-5 py-4 text-sm text-[var(--trackit-muted)]">
                          {formatDate(user.created_at)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/admin/users/${user.id}`}
                            className={[
                              "inline-flex min-h-9 items-center justify-center",
                              "rounded-lg border px-3.5 text-sm font-semibold",
                              "border-[var(--trackit-border)]",
                              "bg-[var(--trackit-surface)]",
                              "text-[var(--trackit-navy)]",
                              "transition-colors",
                              "hover:border-[var(--trackit-blue)]",
                              "hover:text-[var(--trackit-blue)]",
                              "focus-visible:outline-none",
                              "focus-visible:ring-2",
                              "focus-visible:ring-[var(--trackit-blue-bright)]",
                            ].join(" ")}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 lg:hidden">
              {users.map((user) => (
                <article
                  key={user.id}
                  className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <UserIdentity
                      username={user.username}
                      firstName={user.first_name}
                      lastName={user.last_name}
                      email={user.email}
                    />

                    <span
                      className={[
                        "shrink-0 rounded-full px-2.5 py-1",
                        "text-xs font-semibold",
                        roleClasses(user.role),
                      ].join(" ")}
                    >
                      {roleLabel(user.role)}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[var(--trackit-blue-soft)]/50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
                        Status
                      </p>

                      <span
                        className={[
                          "mt-2 inline-flex rounded-full px-2.5 py-1",
                          "text-xs font-semibold",
                          statusClasses(user.is_active),
                        ].join(" ")}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-[var(--trackit-blue-soft)]/50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--trackit-muted)]">
                        Verification
                      </p>

                      <div className="mt-2">
                        <VerificationBadge
                          verified={user.is_verified}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="text-sm text-[var(--trackit-muted)]">
                      Joined {formatDate(user.created_at)}
                    </p>

                    <Link
                      to={`/admin/users/${user.id}`}
                      className={[
                        "inline-flex min-h-9 items-center justify-center",
                        "rounded-lg border px-3.5 text-sm font-semibold",
                        "border-[var(--trackit-border)]",
                        "bg-[var(--trackit-surface)]",
                        "text-[var(--trackit-navy)]",
                        "transition-colors",
                        "hover:border-[var(--trackit-blue)]",
                        "hover:text-[var(--trackit-blue)]",
                      ].join(" ")}
                    >
                      View
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-raised)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--trackit-muted)]">
                Showing{" "}
                <span className="font-semibold text-[var(--trackit-navy)]">
                  {Math.min(
                    (currentPage - 1) * PAGE_SIZE + 1,
                    total,
                  )}
                </span>
                {" "}–{" "}
                <span className="font-semibold text-[var(--trackit-navy)]">
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    total,
                  )}
                </span>
                {" "}of{" "}
                <span className="font-semibold text-[var(--trackit-navy)]">
                  {total}
                </span>
              </p>

              <div
                className="flex items-center gap-2"
                aria-label="Users pagination"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((currentPageValue) =>
                      Math.max(1, currentPageValue - 1),
                    )
                  }
                  disabled={currentPage <= 1 || query.isFetching}
                >
                  Previous
                </Button>

                <span className="min-w-24 text-center text-sm font-semibold text-[var(--trackit-navy)]">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((currentPageValue) =>
                      Math.min(
                        totalPages,
                        currentPageValue + 1,
                      ),
                    )
                  }
                  disabled={
                    currentPage >= totalPages ||
                    query.isFetching
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
