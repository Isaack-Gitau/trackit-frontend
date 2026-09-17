import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { API_BASE_URL } from "../../api/config";
import { getApiErrorMessage } from "../../api/errors";
import { useAuth } from "../../context/AuthContext";
import { usePublicProfile } from "../../hooks/usePublicProfile";

function getProfileImageUrl(
  profilePicture: string | null,
): string | null {
  if (!profilePicture) {
    return null;
  }

  if (
    profilePicture.startsWith("http://") ||
    profilePicture.startsWith("https://")
  ) {
    return profilePicture;
  }

  const normalizedPath = profilePicture.startsWith("/")
    ? profilePicture
    : `/${profilePicture}`;

  return `${API_BASE_URL}${normalizedPath}`;
}

function getDisplayName(
  firstName: string | null,
  lastName: string | null,
  username: string,
): string {
  const name = [firstName, lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return name || username;
}

function getSocialLabel(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

export function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { accessToken, isAuthenticated } = useAuth();

  const parsedUserId = userId ? Number(userId) : NaN;

  const validUserId =
    Number.isInteger(parsedUserId) && parsedUserId > 0
      ? parsedUserId
      : null;

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = usePublicProfile({
    userId: validUserId,
    accessToken,
  });

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="min-h-[70vh] bg-[var(--trackit-surface)] px-5 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="animate-pulse">
            <div className="h-5 w-24 rounded bg-slate-200" />

            <div className="mt-8 rounded-3xl border border-[var(--trackit-border)] bg-white p-6 shadow-sm sm:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="h-24 w-24 shrink-0 rounded-full bg-slate-200" />

                <div className="w-full">
                  <div className="h-8 w-48 rounded bg-slate-200" />
                  <div className="mt-3 h-5 w-32 rounded bg-slate-200" />
                  <div className="mt-5 h-4 w-full max-w-xl rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-3/4 max-w-lg rounded bg-slate-200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (validUserId === null || isError || !profile) {
    const isNotFound =
      error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status?: unknown }).status === 404;

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
            className="mt-8 rounded-3xl border border-[var(--trackit-border)] bg-white p-8 text-center shadow-sm sm:p-12"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--trackit-blue-soft)] text-2xl font-bold text-[var(--trackit-blue)]">
              ?
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-3xl">
              {isNotFound
                ? "Profile not found"
                : "We couldn't load this profile"}
            </h1>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-[var(--trackit-text-muted)]">
              {isNotFound
                ? "This profile may no longer be available or the account may currently be inactive."
                : getApiErrorMessage(error)}
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

  const profileImageUrl = getProfileImageUrl(
    profile.profile_picture,
  );

  const displayName = getDisplayName(
    profile.first_name,
    profile.last_name,
    profile.username,
  );

  const visibleName =
    profile.first_name || profile.last_name;

  const socialEntries = Object.entries(
    profile.social_links ?? {},
  ).filter(([, value]) => isSafeHttpUrl(value));

  return (
    <main className="min-h-[70vh] bg-[var(--trackit-surface)] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold !text-[var(--trackit-blue)] transition hover:bg-[var(--trackit-blue-soft)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          ← Go back
        </button>

        <section className="mt-6 overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-white shadow-sm">
          <div className="bg-[var(--trackit-deep-navy)] px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-[var(--trackit-blue-soft)] text-3xl font-bold text-[var(--trackit-blue)] shadow-lg">
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt={`${displayName}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.username
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--trackit-bright-blue)]">
                  TrackIt member
                </p>

                <h1 className="mt-2 break-words text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {displayName}
                </h1>

                <p className="mt-2 break-words text-base text-white/65">
                  @{profile.username}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            {profile.bio ? (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                  About
                </h2>

                <p className="mt-3 max-w-3xl whitespace-pre-wrap leading-7 text-[var(--trackit-text-muted)]">
                  {profile.bio}
                </p>
              </section>
            ) : null}

            {visibleName ||
            profile.email ||
            profile.phone_number ? (
              <section
                className={
                  profile.bio
                    ? "mt-10 border-t border-[var(--trackit-border)] pt-8"
                    : ""
                }
              >
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                  Profile information
                </h2>

                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                  {visibleName ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
                        Name
                      </dt>

                      <dd className="mt-1 break-words font-semibold text-[var(--trackit-navy)]">
                        {displayName}
                      </dd>
                    </div>
                  ) : null}

                  {profile.email ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
                        Email
                      </dt>

                      <dd className="mt-1 break-words font-semibold text-[var(--trackit-navy)]">
                        <a
                          href={`mailto:${profile.email}`}
                          className="!text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)]"
                        >
                          {profile.email}
                        </a>
                      </dd>
                    </div>
                  ) : null}

                  {profile.phone_number ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--trackit-text-muted)]">
                        Phone
                      </dt>

                      <dd className="mt-1 break-words font-semibold text-[var(--trackit-navy)]">
                        <a
                          href={`tel:${profile.phone_number}`}
                          className="!text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)]"
                        >
                          {profile.phone_number}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}

            {socialEntries.length > 0 ? (
              <section className="mt-10 border-t border-[var(--trackit-border)] pt-8">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                  Social links
                </h2>

                <div className="mt-5 flex flex-wrap gap-3">
                  {socialEntries.map(([key, value]) => (
                    <a
                      key={key}
                      href={value as string}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex min-h-10 items-center rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-4 text-sm font-semibold !text-[var(--trackit-blue)] transition hover:border-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                    >
                      {getSocialLabel(key)}
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {!profile.bio &&
            !visibleName &&
            !profile.email &&
            !profile.phone_number &&
            socialEntries.length === 0 ? (
              <div className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 py-6">
                <p className="text-sm leading-6 text-[var(--trackit-text-muted)]">
                  This member has chosen to keep their optional
                  profile information private.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
