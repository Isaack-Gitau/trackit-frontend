import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { API_BASE_URL } from "../../api/config";
import {
  ApiError,
  getApiErrorMessage,
} from "../../api/errors";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useMyClaims } from "../../hooks/useMyClaims";
import { useMyItems } from "../../hooks/useMyItems";
import {
  useDeleteProfilePicture,
  useUpdateProfile,
  useUpdateProfilePrivacy,
  useUploadProfilePicture,
} from "../../hooks/useProfileMutations";
import { useProfile } from "../../hooks/useProfile";
import type { ClaimStatus } from "../../types/claim";
import type { Item } from "../../types/item";
import type {
  ProfilePrivacyUpdatePayload,
  ProfileSocialLinks,
} from "../../types/profile";

function getMediaUrl(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = value.replace(/^\/+/, "");

  if (normalizedPath.startsWith("media/")) {
    return `${API_BASE_URL}/${normalizedPath}`;
  }

  if (
    normalizedPath.startsWith("items/") ||
    normalizedPath.startsWith("profiles/")
  ) {
    return `${API_BASE_URL}/media/${normalizedPath}`;
  }

  return `${API_BASE_URL}/${normalizedPath}`;
}

function getProfileImageUrl(
  value: string | null,
): string | null {
  return getMediaUrl(value);
}

function getItemImageUrl(
  value: string | null,
): string | null {
  return getMediaUrl(value);
}

function getInitials(
  firstName: string,
  lastName: string,
  username: string,
): string {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);

  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }

  return (
    username.trim().charAt(0).toUpperCase() ||
    "?"
  );
}

function formatMemberSince(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Member since unavailable";
  }

  return `Member since ${new Intl.DateTimeFormat(
    "en",
    {
      month: "long",
      year: "numeric",
    },
  ).format(date)}`;
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function normalizeSocialLinks(
  links: ProfileSocialLinks,
): string {
  return JSON.stringify(
    links,
    null,
    2,
  );
}

function parseSocialLinks(
  value: string,
): ProfileSocialLinks | null {
  if (!value.trim()) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    return parsed as ProfileSocialLinks;
  } catch {
    return null;
  }
}

function getClaimStatusLabel(
  status: ClaimStatus,
): string {
  switch (status) {
    case "pending":
      return "Pending";

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

function getClaimStatusClasses(
  status: ClaimStatus,
): string {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-800";

    case "rejected":
      return "bg-red-100 text-red-800";

    case "withdrawn":
      return "bg-slate-100 text-slate-700";

    case "pending":
    default:
      return "bg-amber-100 text-amber-800";
  }
}

function getItemStatusLabel(
  status: Item["status"],
): string {
  switch (status) {
    case "pending":
      return "Pending review";

    case "approved":
      return "Available";

    case "rejected":
      return "Rejected";

    case "claimed":
      return "Claimed";

    default:
      return status;
  }
}

function getItemStatusClasses(
  status: Item["status"],
): string {
  switch (status) {
    case "claimed":
      return "bg-emerald-100 text-emerald-800";

    case "rejected":
      return "bg-red-100 text-red-800";

    case "pending":
      return "bg-amber-100 text-amber-800";

    case "approved":
    default:
      return "bg-[var(--trackit-surface-blue)] text-[var(--trackit-navy)]";
  }
}

type ProfileFormState = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  bio: string;
  address: string;
  social_links: string;
};

type PrivacyState = {
  profile_picture: boolean;
  bio: boolean;
  first_name: boolean;
  last_name: boolean;
  email: boolean;
  phone_number: boolean;
  social_links: boolean;
};

type ActivityFilter =
  | "all"
  | "lost"
  | "found"
  | "claimed"
  | "claims";

type ProfilePictureEditorState = {
  file: File;
  previewUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  imageWidth: number;
  imageHeight: number;
  x: number;
  y: number;
  zoom: number;
};

const DEFAULT_PRIVACY: PrivacyState = {
  profile_picture: true,
  bio: true,
  first_name: false,
  last_name: false,
  email: false,
  phone_number: false,
  social_links: false,
};

const PROFILE_CROP_SIZE = 320;
const PROFILE_CROP_MIN_ZOOM = 1;
const PROFILE_CROP_MAX_ZOOM = 3;
const PROFILE_CROP_ZOOM_STEP = 0.1;

function createFormState(
  profile: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string | null;
    bio: string | null;
    address: string | null;
    social_links: ProfileSocialLinks;
  },
): ProfileFormState {
  return {
    username: profile.username,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    phone_number: profile.phone_number ?? "",
    bio: profile.bio ?? "",
    address: profile.address ?? "",
    social_links: normalizeSocialLinks(
      profile.social_links,
    ),
  };
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-[var(--trackit-navy)]"
    >
      {children}
    </label>
  );
}

function FieldHelp({
  children,
}: {
  children: string;
}) {
  return (
    <p className="mt-1.5 text-xs leading-5 text-[var(--trackit-text-muted)]">
      {children}
    </p>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start justify-between gap-5 rounded-xl border border-[var(--trackit-border)] bg-white p-4 transition-colors hover:border-[var(--trackit-blue)]"
    >
      <span>
        <span className="block text-sm font-semibold text-[var(--trackit-navy)]">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-[var(--trackit-text-muted)]">
          {description}
        </span>
      </span>

      <span className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
          className="peer sr-only"
        />

        <span
          aria-hidden="true"
          className="block h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-[var(--trackit-blue)]"
        />

        <span
          aria-hidden="true"
          className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
        />
      </span>
    </label>
  );
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
    <div className="rounded-2xl border border-[var(--trackit-border)] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-[var(--trackit-text-muted)]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)]">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-[var(--trackit-text-muted)]">
        {description}
      </p>
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
      className="h-10 w-10"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />
      <circle
        cx="8.5"
        cy="9"
        r="1.5"
      />
      <path d="m21 15-4.5-4.5L7 20" />
    </svg>
  );
}

function ProfilePicturePlaceholder({
  initials,
}: {
  initials: string;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--trackit-surface-blue)] text-3xl font-extrabold text-[var(--trackit-blue)]">
      {initials}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M14.5 4.5h-5L8 7H5.5A2.5 2.5 0 0 0 3 9.5v7A2.5 2.5 0 0 0 5.5 19h13a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 18.5 7H16z" />
      <circle cx="12" cy="13" r="3.25" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function ZoomInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ItemCard({
  item,
}: {
  item: Item;
}) {
  const imageUrl = getItemImageUrl(
    item.image,
  );

  return (
    <Link
      to={`/items/${item.id}`}
      className="group overflow-hidden rounded-3xl border border-[var(--trackit-border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
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

          <span
            className={[
              "rounded-full px-3 py-1 text-xs font-bold",
              getItemStatusClasses(item.status),
            ].join(" ")}
          >
            {getItemStatusLabel(item.status)}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-extrabold text-[var(--trackit-navy)] group-hover:text-[var(--trackit-blue)]">
          {item.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
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

          <p className="text-[var(--trackit-text-muted)]">
            <span className="font-bold text-[var(--trackit-navy)]">
              Reported:
            </span>{" "}
            {formatDate(item.created_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ClaimActivityCard({
  claim,
}: {
  claim: {
    id: number;
    item_id: number;
    reason: string;
    status: ClaimStatus;
    created_at: string;
  };
}) {
  return (
    <Link
      to={`/items/${claim.item_id}`}
      className="group rounded-2xl border border-[var(--trackit-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
            Claim #{claim.id}
          </p>

          <h3 className="mt-2 text-lg font-extrabold text-[var(--trackit-navy)] group-hover:text-[var(--trackit-blue)]">
            Item #{claim.item_id}
          </h3>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-3 py-1 text-xs font-bold",
            getClaimStatusClasses(
              claim.status,
            ),
          ].join(" ")}
        >
          {getClaimStatusLabel(
            claim.status,
          )}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--trackit-text-muted)]">
        {claim.reason}
      </p>

      <p className="mt-4 border-t border-[var(--trackit-border)] pt-4 text-xs text-[var(--trackit-text-muted)]">
        Submitted {formatDate(claim.created_at)}
      </p>
    </Link>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();

  const {
    accessToken,
    user: authenticatedUser,
    refreshUser,
  } = useAuth();

  const profileQuery =
    useProfile(accessToken);

  const myItemsQuery =
    useMyItems(accessToken);

  const myClaimsQuery =
    useMyClaims(accessToken);

  const updateProfileMutation =
    useUpdateProfile(accessToken);

  const updatePrivacyMutation =
    useUpdateProfilePrivacy(accessToken);

  const uploadProfilePictureMutation =
    useUploadProfilePicture(accessToken);

  const deleteProfilePictureMutation =
    useDeleteProfilePicture(accessToken);

  const profilePictureInputRef =
    useRef<HTMLInputElement>(null);

  const cameraVideoRef =
    useRef<HTMLVideoElement>(null);

  const cameraStreamRef =
    useRef<MediaStream | null>(null);

  const cropImageRef =
    useRef<HTMLImageElement>(null);

  const cropAreaRef =
    useRef<HTMLDivElement>(null);

  const [form, setForm] =
    useState<ProfileFormState | null>(
      null,
    );

  const [privacy, setPrivacy] =
    useState<PrivacyState>(
      DEFAULT_PRIVACY,
    );

  const [isEditing, setIsEditing] =
    useState(false);

  const [
    activityFilter,
    setActivityFilter,
  ] = useState<ActivityFilter>("all");

  const [profileMessage, setProfileMessage] =
    useState("");

  const [privacyMessage, setPrivacyMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [
    profilePictureMessage,
    setProfilePictureMessage,
  ] = useState("");

  const [
    profilePictureError,
    setProfilePictureError,
  ] = useState("");

  const [privacyError, setPrivacyError] =
    useState("");

  const [isCameraOpen, setIsCameraOpen] =
    useState(false);

  const [cameraError, setCameraError] =
    useState("");

  const [isCapturing, setIsCapturing] =
    useState(false);

  const [
    pictureEditor,
    setPictureEditor,
  ] =
    useState<ProfilePictureEditorState | null>(
      null,
    );

  const [
    isPictureEditorOpen,
    setIsPictureEditorOpen,
  ] = useState(false);

  const [
    isApplyingPicture,
    setIsApplyingPicture,
  ] = useState(false);

  const [
    isDraggingPicture,
    setIsDraggingPicture,
  ] = useState(false);

  const pictureDragRef =
    useRef<{
      pointerId: number;
      startX: number;
      startY: number;
      imageX: number;
      imageY: number;
    } | null>(null);

  function stopCameraStream() {
    const stream =
      cameraStreamRef.current;

    if (stream) {
      stream.getTracks().forEach(
        (track) => track.stop(),
      );
    }

    cameraStreamRef.current = null;

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject =
        null;
    }
  }

  function revokePictureEditorUrl() {
    if (pictureEditor?.previewUrl) {
      URL.revokeObjectURL(
        pictureEditor.previewUrl,
      );
    }
  }

  function closePictureEditor() {
    if (isApplyingPicture) {
      return;
    }

    revokePictureEditorUrl();

    setPictureEditor(null);
    setIsPictureEditorOpen(false);
    setIsDraggingPicture(false);
    pictureDragRef.current = null;
  }

  useEffect(() => {
    return () => {
      stopCameraStream();

      if (pictureEditor?.previewUrl) {
        URL.revokeObjectURL(
          pictureEditor.previewUrl,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (!isCameraOpen) {
      stopCameraStream();
      return;
    }

    let cancelled = false;

    async function startCamera() {
      setCameraError("");

      if (!window.isSecureContext) {
        setCameraError(
          "Camera access requires a secure connection. Open TrackIt over HTTPS or localhost.",
        );
        return;
      }

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        setCameraError(
          "Camera access is not supported by this browser.",
        );
        return;
      }

      try {
        let stream: MediaStream;

        try {
          stream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: {
                  facingMode: {
                    ideal: "user",
                  },
                },
                audio: false,
              },
            );
        } catch (error) {
          if (
            error instanceof DOMException &&
            (
              error.name ===
                "OverconstrainedError" ||
              error.name === "NotFoundError"
            )
          ) {
            stream =
              await navigator.mediaDevices.getUserMedia(
                {
                  video: true,
                  audio: false,
                },
              );
          } else {
            throw error;
          }
        }

        if (cancelled) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop(),
            );
          return;
        }

        cameraStreamRef.current =
          stream;

        const video =
          cameraVideoRef.current;

        if (!video) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop(),
            );

          cameraStreamRef.current =
            null;

          return;
        }

        video.srcObject = stream;

        await video.play();
      } catch (error) {
        if (cancelled) {
          return;
        }

        stopCameraStream();

        if (
          error instanceof DOMException &&
          error.name === "NotAllowedError"
        ) {
          setCameraError(
            "Camera access was denied. Allow camera access in your browser and try again.",
          );
        } else if (
          error instanceof DOMException &&
          error.name === "NotFoundError"
        ) {
          setCameraError(
            "No camera was found on this device.",
          );
        } else if (
          error instanceof DOMException &&
          error.name === "NotReadableError"
        ) {
          setCameraError(
            "The camera is currently in use by another application.",
          );
        } else if (
          error instanceof DOMException &&
          error.name === "SecurityError"
        ) {
          setCameraError(
            "Camera access is blocked by the browser security settings.",
          );
        } else {
          setCameraError(
            "We could not access your camera. Please check your browser permissions and try again.",
          );
        }
      }
    }

    void startCamera();

    return () => {
      cancelled = true;
      stopCameraStream();
    };
  }, [isCameraOpen]);

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    setForm(
      createFormState(
        profileQuery.data,
      ),
    );

    const storedPrivacy =
      profileQuery.data.preferences?.privacy;

    if (
      storedPrivacy &&
      typeof storedPrivacy === "object" &&
      !Array.isArray(storedPrivacy)
    ) {
      setPrivacy({
        ...DEFAULT_PRIVACY,
        ...(storedPrivacy as Partial<PrivacyState>),
      });
    }
  }, [profileQuery.data]);

  const profileImageUrl = useMemo(
    () =>
      getProfileImageUrl(
        profileQuery.data?.profile_picture ??
          null,
      ),
    [
      profileQuery.data?.profile_picture,
    ],
  );

  const items = myItemsQuery.data ?? [];
  const claims = myClaimsQuery.data ?? [];

  const statistics = useMemo(
    () => ({
      posted: items.length,
      lost: items.filter(
        (item) => item.type === "lost",
      ).length,
      found: items.filter(
        (item) => item.type === "found",
      ).length,
      claimed: items.filter(
        (item) =>
          item.status === "claimed",
      ).length,
      claims: claims.length,
      approvedClaims: claims.filter(
        (claim) =>
          claim.status === "approved",
      ).length,
    }),
    [claims, items],
  );

  const filteredItems = useMemo(() => {
    switch (activityFilter) {
      case "lost":
        return items.filter(
          (item) => item.type === "lost",
        );

      case "found":
        return items.filter(
          (item) => item.type === "found",
        );

      case "claimed":
        return items.filter(
          (item) =>
            item.status === "claimed",
        );

      default:
        return items;
    }
  }, [activityFilter, items]);

  const displayName =
    profileQuery.data
      ? `${profileQuery.data.first_name} ${profileQuery.data.last_name}`.trim()
      : authenticatedUser
        ? `${authenticatedUser.first_name} ${authenticatedUser.last_name}`.trim()
        : "TrackIt member";

  const username =
    profileQuery.data?.username ??
    authenticatedUser?.username ??
    "";

  const initials = getInitials(
    profileQuery.data?.first_name ??
      authenticatedUser?.first_name ??
      "",
    profileQuery.data?.last_name ??
      authenticatedUser?.last_name ??
      "",
    username,
  );

  if (
    profileQuery.isPending ||
    form === null
  ) {
    return (
      
      <main className="min-h-screen bg-[var(--trackit-surface)] px-5 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto w-full max-w-7xl animate-pulse">
          <div className="h-72 rounded-3xl bg-slate-200" />

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="h-32 rounded-2xl bg-slate-200"
              />
            ))}
          </div>

          <div className="mt-8 h-96 rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (profileQuery.isError) {
    return (
      <main className="min-h-screen bg-[var(--trackit-surface)] px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
            Profile
          </p>

          <h1 className="mt-2 text-2xl font-bold text-red-950">
            We couldn't load your profile
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-800">
            {getApiErrorMessage(
              profileQuery.error,
            )}
          </p>

          <Button
            className="mt-6"
            onClick={() =>
              void profileQuery.refetch()
            }
          >
            Try again
          </Button>
        </div>
      </main>
    );
  }

  const profile = profileQuery.data;

  function openPictureEditor(
    file: File,
  ) {
    const allowedTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);

    if (!allowedTypes.has(file.type)) {
      setProfilePictureError(
        "Profile pictures must be JPEG, PNG, or WebP images.",
      );
      return;
    }

    const maximumSize =
      10 * 1024 * 1024;

    if (file.size > maximumSize) {
      setProfilePictureError(
        "Profile pictures must be 10 MB or smaller.",
      );
      return;
    }

    const previewUrl =
      URL.createObjectURL(file);

    const image = new Image();

    image.onload = () => {
      const baseScale = Math.max(
        PROFILE_CROP_SIZE /
          image.naturalWidth,
        PROFILE_CROP_SIZE /
          image.naturalHeight,
      );

      const imageWidth =
        image.naturalWidth * baseScale;

      const imageHeight =
        image.naturalHeight * baseScale;

      const centeredX =
        (PROFILE_CROP_SIZE -
          imageWidth) /
        2;

      const centeredY =
        (PROFILE_CROP_SIZE -
          imageHeight) /
        2;

      revokePictureEditorUrl();

      setPictureEditor({
        file,
        previewUrl,
        naturalWidth:
          image.naturalWidth,
        naturalHeight:
          image.naturalHeight,
        imageWidth,
        imageHeight,
        x: centeredX,
        y: centeredY,
        zoom: PROFILE_CROP_MIN_ZOOM,
      });

      setProfilePictureMessage("");
      setProfilePictureError("");
      setIsPictureEditorOpen(true);
    };

    image.onerror = () => {
      URL.revokeObjectURL(
        previewUrl,
      );

      setProfilePictureError(
        "We could not read that image. Please choose another photo.",
      );
    };

    image.src = previewUrl;
  }

  function handleProfilePictureChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    openPictureEditor(file);
  }

  function handlePicturePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      !pictureEditor ||
      isApplyingPicture
    ) {
      return;
    }

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

    pictureDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      imageX: pictureEditor.x,
      imageY: pictureEditor.y,
    };

    setIsDraggingPicture(true);
  }

  function handlePicturePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const drag =
      pictureDragRef.current;

    if (
      !drag ||
      !pictureEditor ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    const nextX =
      drag.imageX +
      (event.clientX - drag.startX);

    const nextY =
      drag.imageY +
      (event.clientY - drag.startY);

    const minimumX =
      PROFILE_CROP_SIZE -
      pictureEditor.imageWidth;

    const minimumY =
      PROFILE_CROP_SIZE -
      pictureEditor.imageHeight;

    setPictureEditor({
      ...pictureEditor,
      x: Math.min(
        0,
        Math.max(minimumX, nextX),
      ),
      y: Math.min(
        0,
        Math.max(minimumY, nextY),
      ),
    });
  }

  function handlePicturePointerUp(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      pictureDragRef.current?.pointerId ===
      event.pointerId
    ) {
      pictureDragRef.current = null;
      setIsDraggingPicture(false);
    }
  }

  function updatePictureZoom(
    nextZoom: number,
  ) {
    if (!pictureEditor) {
      return;
    }

    const clampedZoom = Math.min(
      PROFILE_CROP_MAX_ZOOM,
      Math.max(
        PROFILE_CROP_MIN_ZOOM,
        nextZoom,
      ),
    );

    const oldWidth =
      pictureEditor.imageWidth;

    const oldHeight =
      pictureEditor.imageHeight;

    const oldCenterX =
      pictureEditor.x +
      oldWidth / 2;

    const oldCenterY =
      pictureEditor.y +
      oldHeight / 2;

    const baseScale =
      oldWidth /
      pictureEditor.naturalWidth /
      pictureEditor.zoom;

    const nextWidth =
      pictureEditor.naturalWidth *
      baseScale *
      clampedZoom;

    const nextHeight =
      pictureEditor.naturalHeight *
      baseScale *
      clampedZoom;

    let nextX =
      oldCenterX -
      nextWidth / 2;

    let nextY =
      oldCenterY -
      nextHeight / 2;

    const minimumX =
      PROFILE_CROP_SIZE -
      nextWidth;

    const minimumY =
      PROFILE_CROP_SIZE -
      nextHeight;

    nextX = Math.min(
      0,
      Math.max(minimumX, nextX),
    );

    nextY = Math.min(
      0,
      Math.max(minimumY, nextY),
    );

    setPictureEditor({
      ...pictureEditor,
      imageWidth: nextWidth,
      imageHeight: nextHeight,
      x: nextX,
      y: nextY,
      zoom: clampedZoom,
    });
  }

  function resetPicturePosition() {
    if (!pictureEditor) {
      return;
    }

    const baseScale = Math.max(
      PROFILE_CROP_SIZE /
        pictureEditor.naturalWidth,
      PROFILE_CROP_SIZE /
        pictureEditor.naturalHeight,
    );

    const imageWidth =
      pictureEditor.naturalWidth *
      baseScale;

    const imageHeight =
      pictureEditor.naturalHeight *
      baseScale;

    setPictureEditor({
      ...pictureEditor,
      imageWidth,
      imageHeight,
      x:
        (PROFILE_CROP_SIZE -
          imageWidth) /
        2,
      y:
        (PROFILE_CROP_SIZE -
          imageHeight) /
        2,
      zoom: PROFILE_CROP_MIN_ZOOM,
    });
  }

  async function uploadProfilePicture(
    file: File,
  ) {
    setProfilePictureMessage("");
    setProfilePictureError("");

    try {
      const updatedProfile =
        await uploadProfilePictureMutation.mutateAsync({
          file,
        });

      setForm(
        createFormState(updatedProfile),
      );

      setProfilePictureMessage(
        "Your profile picture has been updated.",
      );

      await refreshUser();

      return true;
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        setProfilePictureError(
          "Your session is no longer valid. Please sign in again.",
        );
      } else {
        setProfilePictureError(
          getApiErrorMessage(error),
        );
      }

      return false;
    }
  }

  async function handleApplyPicture() {
    if (
      !pictureEditor ||
      isApplyingPicture
    ) {
      return;
    }

    setIsApplyingPicture(true);
    setProfilePictureError("");
    setProfilePictureMessage("");

    try {
      const image =
        cropImageRef.current;

      if (!image) {
        throw new Error(
          "The profile picture is still loading. Please try again.",
        );
      }

      if (
        !image.complete ||
        image.naturalWidth === 0 ||
        image.naturalHeight === 0
      ) {
        throw new Error(
          "The profile picture is still loading. Please try again.",
        );
      }

      const displayScale =
        pictureEditor.imageWidth /
        pictureEditor.naturalWidth;

      if (displayScale <= 0) {
        throw new Error(
          "Unable to prepare the selected crop.",
        );
      }

      const sourceX =
        Math.max(
          0,
          -pictureEditor.x /
            displayScale,
        );

      const sourceY =
        Math.max(
          0,
          -pictureEditor.y /
            displayScale,
        );

      const sourceSize =
        PROFILE_CROP_SIZE /
        displayScale;

      const boundedSourceSize =
        Math.min(
          sourceSize,
          pictureEditor.naturalWidth -
            sourceX,
          pictureEditor.naturalHeight -
            sourceY,
        );

      const canvas =
        document.createElement(
          "canvas",
        );

      canvas.width = 800;
      canvas.height = 800;

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Unable to prepare the selected crop.",
        );
      }

      context.imageSmoothingEnabled =
        true;
      context.imageSmoothingQuality =
        "high";

      context.drawImage(
        image,
        sourceX,
        sourceY,
        boundedSourceSize,
        boundedSourceSize,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const blob =
        await new Promise<Blob>(
          (resolve, reject) => {
            canvas.toBlob(
              (result) => {
                if (result) {
                  resolve(result);
                  return;
                }

                reject(
                  new Error(
                    "Unable to create the selected profile picture.",
                  ),
                );
              },
              "image/jpeg",
              0.9,
            );
          },
        );

      const file = new File(
        [blob],
        `trackit-profile-${Date.now()}.jpg`,
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        },
      );

      const uploaded =
        await uploadProfilePicture(
          file,
        );

      if (uploaded) {
        revokePictureEditorUrl();

        setPictureEditor(null);
        setIsPictureEditorOpen(false);
        setIsDraggingPicture(false);
        pictureDragRef.current = null;
      }
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        setProfilePictureError(
          "Your session is no longer valid. Please sign in again.",
        );
      } else if (
        error instanceof Error
      ) {
        setProfilePictureError(
          error.message ||
            "We could not save your profile picture. Please try again.",
        );
      } else {
        setProfilePictureError(
          "We could not save your profile picture. Please try again.",
        );
      }
    } finally {
      setIsApplyingPicture(false);
    }
  }

  function handleOpenCamera() {
    setProfilePictureMessage("");
    setProfilePictureError("");
    setCameraError("");
    setIsCameraOpen(true);
  }

  function handleCloseCamera() {
    if (isCapturing) {
      return;
    }

    stopCameraStream();
    setIsCameraOpen(false);
    setCameraError("");
  }

  async function handleCaptureProfilePicture() {
    const video =
      cameraVideoRef.current;

    if (
      !video ||
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      setCameraError(
        "The camera is still starting. Please wait a moment and try again.",
      );
      return;
    }

    setCameraError("");
    setProfilePictureError("");
    setIsCapturing(true);

    try {
      const maximumDimension = 1600;

      const scale = Math.min(
        1,
        maximumDimension /
          Math.max(
            video.videoWidth,
            video.videoHeight,
          ),
      );

      const canvas =
        document.createElement(
          "canvas",
        );

      canvas.width = Math.max(
        1,
        Math.round(
          video.videoWidth * scale,
        ),
      );

      canvas.height = Math.max(
        1,
        Math.round(
          video.videoHeight * scale,
        ),
      );

      const context =
        canvas.getContext("2d");

      if (!context) {
        throw new Error(
          "Unable to prepare the camera image.",
        );
      }

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const blob =
        await new Promise<Blob>(
          (resolve, reject) => {
            canvas.toBlob(
              (result) => {
                if (result) {
                  resolve(result);
                  return;
                }

                reject(
                  new Error(
                    "Unable to create the captured image.",
                  ),
                );
              },
              "image/jpeg",
              0.88,
            );
          },
        );

      const file = new File(
        [blob],
        `trackit-camera-${Date.now()}.jpg`,
        {
          type: "image/jpeg",
          lastModified: Date.now(),
        },
      );

      stopCameraStream();
      setIsCameraOpen(false);
      setCameraError("");

      openPictureEditor(file);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        setProfilePictureError(
          "Your session is no longer valid. Please sign in again.",
        );
      } else if (
        error instanceof Error
      ) {
        setCameraError(
          error.message ||
            "We could not capture your profile picture. Please try again.",
        );
      } else {
        setCameraError(
          "We could not capture your profile picture. Please try again.",
        );
      }
    } finally {
      setIsCapturing(false);
    }
  }

  async function handleDeleteProfilePicture() {
    if (
      !profileImageUrl ||
      deleteProfilePictureMutation.isPending
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Remove your current profile picture? This cannot be undone.",
      );

    if (!confirmed) {
      return;
    }

    setProfilePictureMessage("");
    setProfilePictureError("");

    try {
      const updatedProfile =
        await deleteProfilePictureMutation.mutateAsync(
          {},
        );

      setForm(
        createFormState(updatedProfile),
      );

      setProfilePictureMessage(
        "Your profile picture has been removed.",
      );

      await refreshUser();
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        setProfilePictureError(
          "Your session is no longer valid. Please sign in again.",
        );
      } else {
        setProfilePictureError(
          getApiErrorMessage(error),
        );
      }
    }
  }

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    const socialLinks =
      parseSocialLinks(
        form.social_links,
      );

    if (socialLinks === null) {
      setProfileError(
        "Social links must be valid JSON containing an object.",
      );
      return;
    }

    try {
      const updatedProfile =
        await updateProfileMutation.mutateAsync({
          payload: {
            username: form.username.trim(),
            email: form.email.trim(),
            first_name:
              form.first_name.trim(),
            last_name:
              form.last_name.trim(),
            phone_number:
              form.phone_number.trim() ||
              null,
            bio:
              form.bio.trim() || null,
            address:
              form.address.trim() || null,
            social_links:
              socialLinks,
          },
        });

      setForm(
        createFormState(
          updatedProfile,
        ),
      );

      setProfileMessage(
        "Your profile has been updated.",
      );

      setIsEditing(false);

      await refreshUser();
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 401
      ) {
        setProfileError(
          "Your session is no longer valid. Please sign in again.",
        );
      } else if (
        error instanceof ApiError &&
        error.status === 409
      ) {
        setProfileError(
          error.message,
        );
      } else {
        setProfileError(
          getApiErrorMessage(error),
        );
      }
    }
  }

  async function handlePrivacySubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPrivacyMessage("");
    setPrivacyError("");

    const payload: ProfilePrivacyUpdatePayload =
      {
        ...privacy,
      };

    try {
      const updatedPrivacy =
        await updatePrivacyMutation.mutateAsync({
          payload,
        });

      setPrivacy(
        updatedPrivacy,
      );

      setPrivacyMessage(
        "Your public-profile privacy settings have been updated.",
      );
    } catch (error) {
      setPrivacyError(
        getApiErrorMessage(error),
      );
    }
  }

  function cancelEditing() {
    setForm(
      createFormState(profile),
    );

    setProfileError("");
    setProfileMessage("");
    setIsEditing(false);
  }

  const activityTabs: Array<{
    value: ActivityFilter;
    label: string;
    count: number;
  }> = [
    {
      value: "all",
      label: "All activity",
      count: items.length,
    },
    {
      value: "lost",
      label: "Lost",
      count: statistics.lost,
    },
    {
      value: "found",
      label: "Found",
      count: statistics.found,
    },
    {
      value: "claimed",
      label: "Claimed",
      count: statistics.claimed,
    },
    {
      value: "claims",
      label: "My claims",
      count: statistics.claims,
    },
  ];

  const showClaims =
    activityFilter === "claims";

  const pictureEditorBusy =
    isApplyingPicture ||
    uploadProfilePictureMutation.isPending;

  return (
    <main className="min-h-screen bg-[var(--trackit-surface)] px-5 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto w-full max-w-7xl">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1);
            } else {
              navigate("/dashboard");
            }
          }}
          className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--trackit-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--trackit-navy)] shadow-sm transition hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>

        <section className="overflow-hidden rounded-3xl bg-[var(--trackit-deep-navy)] text-white shadow-xl shadow-black/10">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="flex justify-center lg:justify-start">
                <div className="relative">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white/15 bg-white/10 shadow-xl sm:h-36 sm:w-36">
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt={`${displayName}'s profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ProfilePicturePlaceholder
                        initials={initials}
                      />
                    )}
                  </div>

                  <input
                    ref={profilePictureInputRef}
                    id="profile-picture-upload"
                    name="profile-picture"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={
                      handleProfilePictureChange
                    }
                    disabled={
                      pictureEditorBusy ||
                      deleteProfilePictureMutation.isPending ||
                      isCameraOpen
                    }
                  />

                  <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        profilePictureInputRef.current?.click()
                      }
                      disabled={
                        pictureEditorBusy ||
                        deleteProfilePictureMutation.isPending ||
                        isCameraOpen
                      }
                      className="whitespace-nowrap rounded-full border border-white/15 bg-[var(--trackit-blue)] px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploadProfilePictureMutation.isPending
                        ? "Uploading..."
                        : "Change photo"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleOpenCamera
                      }
                      disabled={
                        pictureEditorBusy ||
                        deleteProfilePictureMutation.isPending ||
                        isCameraOpen
                      }
                      title="Take a profile photo"
                      aria-label="Take a profile photo"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CameraIcon />
                    </button>

                    {profileImageUrl ? (
                      <button
                        type="button"
                        onClick={
                          handleDeleteProfilePicture
                        }
                        disabled={
                          pictureEditorBusy ||
                          deleteProfilePictureMutation.isPending ||
                          isCameraOpen
                        }
                        title="Remove profile photo"
                        aria-label="Remove profile photo"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-300/30 bg-red-500/15 text-red-100 shadow-lg backdrop-blur-sm transition hover:bg-red-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path d="M4 7h16" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M6 7l1 13h10l1-13" />
                          <path d="M9 7V4h6v3" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="min-w-0 text-center lg:text-left">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
                  Your TrackIt profile
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {displayName}
                  </h1>

                  {profile.is_verified ? (
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
                      Verification pending
                    </span>
                  )}
                </div>

                <p className="mt-2 text-white/65">
                  @{profile.username}
                </p>

                <p className="mt-3 text-sm text-white/55">
                  {formatMemberSince(
                    profile.created_at,
                  )}
                </p>

                {profile.bio ? (
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">
                    Add a short bio so other TrackIt members can learn a little about you.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  to={`/users/${profile.id}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  View public profile
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMessage("");
                    setProfileError("");
                    setIsEditing(true);
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Edit profile
                </button>
              </div>
            </div>

            {profilePictureMessage ? (
              <div
                role="status"
                className="mt-8 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-100"
              >
                {profilePictureMessage}
              </div>
            ) : null}

            {profilePictureError ? (
              <div
                role="alert"
                className="mt-8 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100"
              >
                {profilePictureError}
              </div>
            ) : null}
          </div>
        </section>

        <section
          aria-label="Profile statistics"
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          <StatCard
            label="Items posted"
            value={statistics.posted}
            description="All reports you've submitted"
          />

          <StatCard
            label="Lost"
            value={statistics.lost}
            description="Lost-item reports"
          />

          <StatCard
            label="Found"
            value={statistics.found}
            description="Found-item reports"
          />

          <StatCard
            label="Claimed"
            value={statistics.claimed}
            description="Your reports marked claimed"
          />

          <StatCard
            label="Claims made"
            value={statistics.claims}
            description={`${statistics.approvedClaims} approved`}
          />
        </section>

        {profileMessage ? (
          <div
            role="status"
            className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800"
          >
            {profileMessage}
          </div>
        ) : null}

        {profileError && !isEditing ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-800"
          >
            {profileError}
          </div>
        ) : null}

        <section className="mt-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Your activity
              </p>

              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)]">
                Reports and claims
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--trackit-text-muted)]">
                Keep track of the lost and found reports you've submitted and the claims you've made.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <div className="inline-flex min-w-full gap-2 rounded-2xl border border-[var(--trackit-border)] bg-white p-2 shadow-sm sm:min-w-0">
              {activityTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    setActivityFilter(
                      tab.value,
                    )
                  }
                  className={[
                    "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold transition-colors",
                    activityFilter ===
                    tab.value
                      ? "bg-[var(--trackit-blue)] text-white"
                      : "text-[var(--trackit-navy)] hover:bg-[var(--trackit-surface-blue)]",
                  ].join(" ")}
                >
                  {tab.label}

                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs",
                      activityFilter ===
                      tab.value
                        ? "bg-white/15 text-white"
                        : "bg-[var(--trackit-surface-blue)] text-[var(--trackit-blue)]",
                    ].join(" ")}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {showClaims ? (
            myClaimsQuery.isPending ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {Array.from({
                  length: 4,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-48 animate-pulse rounded-2xl bg-slate-200"
                  />
                ))}
              </div>
            ) : myClaimsQuery.isError ? (
              <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
                <h3 className="text-lg font-bold text-red-900">
                  We couldn't load your claims
                </h3>

                <p className="mt-2 text-sm leading-7 text-red-800">
                  {getApiErrorMessage(
                    myClaimsQuery.error,
                  )}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void myClaimsQuery.refetch()
                  }
                  className="mt-5 min-h-11 rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white hover:bg-[var(--trackit-blue-hover)]"
                >
                  Try again
                </button>
              </div>
            ) : claims.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-[var(--trackit-border)] bg-white px-6 py-12 text-center">
                <h3 className="text-lg font-bold text-[var(--trackit-navy)]">
                  No claims yet
                </h3>

                <p className="mt-2 text-sm leading-7 text-[var(--trackit-text-muted)]">
                  Claims you submit against found items will appear here.
                </p>

                <Link
                  to="/discover"
                  className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white hover:bg-[var(--trackit-blue-hover)]"
                >
                  Discover items
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {claims.map(
                  (claim) => (
                    <ClaimActivityCard
                      key={claim.id}
                      claim={claim}
                    />
                  ),
                )}
              </div>
            )
          ) : myItemsQuery.isPending ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="h-96 animate-pulse rounded-3xl bg-slate-200"
                />
              ))}
            </div>
          ) : myItemsQuery.isError ? (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
              <h3 className="text-lg font-bold text-red-900">
                We couldn't load your items
              </h3>

              <p className="mt-2 text-sm leading-7 text-red-800">
                {getApiErrorMessage(
                  myItemsQuery.error,
                )}
              </p>

              <button
                type="button"
                onClick={() =>
                  void myItemsQuery.refetch()
                }
                className="mt-5 min-h-11 rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white hover:bg-[var(--trackit-blue-hover)]"
              >
                Try again
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-[var(--trackit-border)] bg-white px-6 py-12 text-center">
              <h3 className="text-lg font-bold text-[var(--trackit-navy)]">
                {activityFilter ===
                "all"
                  ? "You haven't posted any items yet"
                  : "No items in this section"}
              </h3>

              <p className="mt-2 text-sm leading-7 text-[var(--trackit-text-muted)]">
                {activityFilter ===
                "all"
                  ? "Your lost and found reports will appear here after you submit them."
                  : "Try another activity filter or report a new item."}
              </p>

              <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to="/items/report-lost"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white hover:bg-[var(--trackit-blue-hover)]"
                >
                  Report lost item
                </Link>

                <Link
                  to="/items/report-found"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--trackit-border)] bg-white px-5 text-sm font-bold text-[var(--trackit-navy)] hover:border-[var(--trackit-blue)]"
                >
                  Report found item
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map(
                (item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                  />
                ),
              )}
            </div>
          )}
        </section>

        {isEditing ? (
          <section className="mt-12">
            <div className="flex flex-col gap-3 border-b border-[var(--trackit-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Profile settings
                </p>

                <h2 className="mt-2 text-3xl font-extrabold text-[var(--trackit-navy)]">
                  Edit your profile
                </h2>

                <p className="mt-2 text-sm leading-7 text-[var(--trackit-text-muted)]">
                  Update the information you want associated with your TrackIt account.
                </p>
              </div>

              <button
                type="button"
                onClick={cancelEditing}
                className="min-h-10 rounded-lg px-3 text-sm font-bold text-[var(--trackit-blue)] hover:bg-[var(--trackit-surface-blue)]"
              >
                Cancel editing
              </button>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
              <section className="rounded-3xl border border-[var(--trackit-border)] bg-white p-6 shadow-sm sm:p-8">
                {profileError ? (
                  <div
                    role="alert"
                    className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                  >
                    {profileError}
                  </div>
                ) : null}

                <form
                  onSubmit={
                    handleProfileSubmit
                  }
                  className="space-y-6"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <FieldLabel htmlFor="profile-first-name">
                        First name
                      </FieldLabel>

                      <input
                        id="profile-first-name"
                        value={form.first_name}
                        onChange={(
                          event,
                        ) =>
                          setForm({
                            ...form,
                            first_name:
                              event.target
                                .value,
                          })
                        }
                        maxLength={100}
                        required
                        disabled={
                          updateProfileMutation.isPending
                        }
                        className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:bg-slate-50"
                      />
                    </div>

                    <div>
                      <FieldLabel htmlFor="profile-last-name">
                        Last name
                      </FieldLabel>

                      <input
                        id="profile-last-name"
                        value={form.last_name}
                        onChange={(
                          event,
                        ) =>
                          setForm({
                            ...form,
                            last_name:
                              event.target
                                .value,
                          })
                        }
                        maxLength={100}
                        required
                        disabled={
                          updateProfileMutation.isPending
                        }
                        className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <FieldLabel htmlFor="profile-username">
                      Username
                    </FieldLabel>

                    <input
                      id="profile-username"
                      value={form.username}
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,
                          username:
                            event.target.value,
                        })
                      }
                      minLength={3}
                      maxLength={50}
                      required
                      autoComplete="username"
                      disabled={
                        updateProfileMutation.isPending
                      }
                      className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:bg-slate-50"
                    />

                    <FieldHelp>
                      Your username is always visible on your public TrackIt profile.
                    </FieldHelp>
                  </div>

                  <div>
                    <FieldLabel htmlFor="profile-email">
                      Email address
                    </FieldLabel>

                    <input
                      id="profile-email"
                      type="email"
                      value={form.email}
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,
                          email:
                            event.target.value,
                        })
                      }
                      maxLength={255}
                      required
                      autoComplete="email"
                      disabled={
                        updateProfileMutation.isPending
                      }
                      className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:bg-slate-50"
                    />

                    <FieldHelp>
                      Changing your email requires verification again and invalidates existing sessions.
                    </FieldHelp>
                  </div>

                  <div>
                    <FieldLabel htmlFor="profile-phone">
                      Phone number
                    </FieldLabel>

                    <input
                      id="profile-phone"
                      type="tel"
                      value={
                        form.phone_number
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,
                          phone_number:
                            event.target.value,
                        })
                      }
                      maxLength={30}
                      autoComplete="tel"
                      disabled={
                        updateProfileMutation.isPending
                      }
                      className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:bg-slate-50"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <FieldLabel htmlFor="profile-bio">
                      Bio
                    </FieldLabel>

                    <textarea
                      id="profile-bio"
                      value={form.bio}
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,
                          bio: event.target.value,
                        })
                      }
                      maxLength={500}
                      rows={5}
                      disabled={
                        updateProfileMutation.isPending
                      }
                      className="mt-2 w-full resize-y rounded-xl border border-[var(--trackit-border)] bg-white px-4 py-3 text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:bg-slate-50"
                      placeholder="Tell the TrackIt community a little about yourself."
                    />

                    <FieldHelp>
                      Maximum 500 characters.
                    </FieldHelp>
                  </div>

                  <div>
                    <FieldLabel htmlFor="profile-address">
                      Address
                    </FieldLabel>

                    <input
                      id="profile-address"
                      value={form.address}
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,
                          address:
                            event.target.value,
                        })
                      }
                      maxLength={255}
                      disabled={
                        updateProfileMutation.isPending
                      }
                      className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:bg-slate-50"
                      placeholder="Optional"
                    />

                    <FieldHelp>
                      Your address remains private through the public-profile system.
                    </FieldHelp>
                  </div>

                  <div>
                    <FieldLabel htmlFor="profile-social-links">
                      Social links
                    </FieldLabel>

                    <textarea
                      id="profile-social-links"
                      value={
                        form.social_links
                      }
                      onChange={(
                        event,
                      ) =>
                        setForm({
                          ...form,
                          social_links:
                            event.target.value,
                        })
                      }
                      rows={7}
                      spellCheck={false}
                      disabled={
                        updateProfileMutation.isPending
                      }
                      className="mt-2 w-full resize-y rounded-xl border border-[var(--trackit-border)] bg-white px-4 py-3 font-mono text-sm text-[var(--trackit-navy)] outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:bg-slate-50"
                      placeholder={`{
  "website": "https://example.com"
}`}
                    />

                    <FieldHelp>
                      Enter your social links.
                    </FieldHelp>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-[var(--trackit-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-[var(--trackit-text-muted)]">
                      TrackIt validates these fields on the server.
                    </p>

                    <Button
                      type="submit"
                      loading={
                        updateProfileMutation.isPending
                      }
                      disabled={
                        !form.username.trim() ||
                        !form.email.trim() ||
                        !form.first_name.trim() ||
                        !form.last_name.trim()
                      }
                    >
                      Save profile
                    </Button>
                  </div>
                </form>
              </section>

              <aside>
                <section className="rounded-3xl border border-[var(--trackit-border)] bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                    Public profile
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-[var(--trackit-navy)]">
                    Control what others can see
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    These settings affect the profile other authenticated TrackIt members can view.
                  </p>

                  {privacyMessage ? (
                    <div
                      role="status"
                      className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800"
                    >
                      {privacyMessage}
                    </div>
                  ) : null}

                  {privacyError ? (
                    <div
                      role="alert"
                      className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                    >
                      {privacyError}
                    </div>
                  ) : null}

                  <form
                    onSubmit={
                      handlePrivacySubmit
                    }
                    className="mt-6 space-y-3"
                  >
                    <Toggle
                      id="privacy-profile-picture"
                      checked={
                        privacy.profile_picture
                      }
                      onChange={(
                        value,
                      ) =>
                        setPrivacy({
                          ...privacy,
                          profile_picture:
                            value,
                        })
                      }
                      label="Profile picture"
                      description="Allow your profile picture to appear on your public profile and comments."
                    />

                    <Toggle
                      id="privacy-bio"
                      checked={
                        privacy.bio
                      }
                      onChange={(
                        value,
                      ) =>
                        setPrivacy({
                          ...privacy,
                          bio: value,
                        })
                      }
                      label="Bio"
                      description="Allow members to read your profile biography."
                    />

                    <Toggle
                      id="privacy-first-name"
                      checked={
                        privacy.first_name
                      }
                      onChange={(
                        value,
                      ) =>
                        setPrivacy({
                          ...privacy,
                          first_name:
                            value,
                        })
                      }
                      label="First name"
                      description="Show your first name alongside your username."
                    />

                    <Toggle
                      id="privacy-last-name"
                      checked={
                        privacy.last_name
                      }
                      onChange={(
                        value,
                      ) =>
                        setPrivacy({
                          ...privacy,
                          last_name:
                            value,
                        })
                      }
                      label="Last name"
                      description="Show your last name alongside your username."
                    />

                    <Toggle
                      id="privacy-email"
                      checked={
                        privacy.email
                      }
                      onChange={(
                        value,
                      ) =>
                        setPrivacy({
                          ...privacy,
                          email: value,
                        })
                      }
                      label="Email address"
                      description="Allow your email address to appear on your public profile."
                    />

                    <Toggle
                      id="privacy-phone"
                      checked={
                        privacy.phone_number
                      }
                      onChange={(
                        value,
                      ) =>
                        setPrivacy({
                          ...privacy,
                          phone_number:
                            value,
                        })
                      }
                      label="Phone number"
                      description="Allow your phone number to appear on your public profile."
                    />

                    <Toggle
                      id="privacy-social-links"
                      checked={
                        privacy.social_links
                      }
                      onChange={(
                        value,
                      ) =>
                        setPrivacy({
                          ...privacy,
                          social_links:
                            value,
                        })
                      }
                      label="Social links"
                      description="Allow your configured social links to appear on your public profile."
                    />

                    <Button
                      type="submit"
                      variant="outline"
                      fullWidth
                      loading={
                        updatePrivacyMutation.isPending
                      }
                      className="mt-2"
                    >
                      Save privacy settings
                    </Button>
                  </form>
                </section>

                <div className="mt-5 rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-light)] p-6">
                  <p className="text-sm font-semibold text-[var(--trackit-navy)]">
                    Profile visibility
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    Your username is always visible to authenticated TrackIt members. Other fields follow your privacy settings.
                  </p>

                  <Link
                    to={`/users/${profile.id}`}
                    className="mt-4 inline-flex text-sm font-bold text-[var(--trackit-blue)] hover:text-[var(--trackit-blue-hover)]"
                  >
                    View your public profile
                  </Link>
                </div>
              </aside>
            </div>
          </section>
        ) : null}
      </div>

      {isCameraOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-dialog-title"
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--trackit-border)] px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Profile photo
                </p>

                <h2
                  id="camera-dialog-title"
                  className="mt-1 text-xl font-extrabold text-[var(--trackit-navy)]"
                >
                  Take a photo
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  handleCloseCamera
                }
                disabled={isCapturing}
                aria-label="Close camera"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="relative overflow-hidden rounded-2xl bg-black">
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="aspect-video w-full object-cover"
                  aria-label="Live camera preview"
                />

                {cameraError ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center">
                    <div className="max-w-md">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-200">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                          aria-hidden="true"
                        >
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                          <path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                        </svg>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-white">
                        {cameraError}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {profilePictureError ? (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                >
                  {profilePictureError}
                </div>
              ) : null}

              <p className="mt-4 text-center text-sm leading-6 text-[var(--trackit-text-muted)]">
                Position yourself in the camera frame, then capture the photo. You'll be able to adjust the final profile crop before saving it.
              </p>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={
                    handleCloseCamera
                  }
                  disabled={isCapturing}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-white px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:border-[var(--trackit-blue)] hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleCaptureProfilePicture
                  }
                  disabled={
                    isCapturing ||
                    uploadProfilePictureMutation.isPending ||
                    Boolean(cameraError)
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-6 text-sm font-bold text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCapturing
                    ? "Preparing photo..."
                    : "Capture photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isPictureEditorOpen &&
      pictureEditor ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="picture-editor-title"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--trackit-border)] px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                  Profile photo
                </p>

                <h2
                  id="picture-editor-title"
                  className="mt-1 text-xl font-extrabold text-[var(--trackit-navy)]"
                >
                  Position your photo
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closePictureEditor
                }
                disabled={pictureEditorBusy}
                aria-label="Close photo editor"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--trackit-navy)] transition hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <div className="flex justify-center">
                <div
                  ref={cropAreaRef}
                  className={[
                    "relative overflow-hidden rounded-full bg-slate-100 shadow-inner touch-none select-none",
                    isDraggingPicture
                      ? "cursor-grabbing"
                      : "cursor-grab",
                  ].join(" ")}
                  style={{
                    width: PROFILE_CROP_SIZE,
                    height: PROFILE_CROP_SIZE,
                    maxWidth: "100%",
                  }}
                  onPointerDown={
                    handlePicturePointerDown
                  }
                  onPointerMove={
                    handlePicturePointerMove
                  }
                  onPointerUp={
                    handlePicturePointerUp
                  }
                  onPointerCancel={
                    handlePicturePointerUp
                  }
                >
                  <img
                    ref={cropImageRef}
                    src={
                      pictureEditor.previewUrl
                    }
                    alt="Profile photo preview"
                    draggable={false}
                    className="pointer-events-none absolute max-w-none select-none"
                    style={{
                      width:
                        pictureEditor.imageWidth,
                      height:
                        pictureEditor.imageHeight,
                      left:
                        pictureEditor.x,
                      top:
                        pictureEditor.y,
                    }}
                  />

                  <div className="pointer-events-none absolute inset-0 rounded-full border-4 border-white/90 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12)]" />

                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white/80 shadow" />
                  </div>
                </div>
              </div>

              <p className="mt-5 text-center text-sm leading-6 text-[var(--trackit-text-muted)]">
                Drag the photo to position yourself inside the circle. Use the zoom control to adjust the framing.
              </p>

              <div className="mt-6 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updatePictureZoom(
                        pictureEditor.zoom -
                          PROFILE_CROP_ZOOM_STEP,
                      )
                    }
                    disabled={
                      pictureEditor.zoom <=
                        PROFILE_CROP_MIN_ZOOM ||
                      pictureEditorBusy
                    }
                    aria-label="Zoom out"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--trackit-border)] bg-white text-[var(--trackit-navy)] transition hover:border-[var(--trackit-blue)] hover:text-[var(--trackit-blue)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ZoomOutIcon />
                  </button>

                  <input
                    type="range"
                    min={
                      PROFILE_CROP_MIN_ZOOM
                    }
                    max={
                      PROFILE_CROP_MAX_ZOOM
                    }
                    step="0.1"
                    value={
                      pictureEditor.zoom
                    }
                    onChange={(event) =>
                      updatePictureZoom(
                        Number(
                          event.target.value,
                        ),
                      )
                    }
                    disabled={
                      pictureEditorBusy
                    }
                    aria-label="Photo zoom"
                    className="h-2 w-full cursor-pointer accent-[var(--trackit-blue)] disabled:cursor-not-allowed"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updatePictureZoom(
                        pictureEditor.zoom +
                          PROFILE_CROP_ZOOM_STEP,
                      )
                    }
                    disabled={
                      pictureEditor.zoom >=
                        PROFILE_CROP_MAX_ZOOM ||
                      pictureEditorBusy
                    }
                    aria-label="Zoom in"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--trackit-border)] bg-white text-[var(--trackit-navy)] transition hover:border-[var(--trackit-blue)] hover:text-[var(--trackit-blue)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ZoomInIcon />
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-[var(--trackit-text-muted)]">
                  <span>Zoom</span>

                  <span className="font-bold text-[var(--trackit-navy)]">
                    {Math.round(
                      pictureEditor.zoom *
                        100,
                    )}
                    %
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  resetPicturePosition
                }
                disabled={pictureEditorBusy}
                className="mt-4 w-full text-sm font-bold text-[var(--trackit-blue)] hover:text-[var(--trackit-blue-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset position
              </button>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closePictureEditor
                  }
                  disabled={pictureEditorBusy}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--trackit-border)] bg-white px-5 text-sm font-bold text-[var(--trackit-navy)] transition hover:border-[var(--trackit-blue)] hover:bg-[var(--trackit-surface-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={
                    handleApplyPicture
                  }
                  disabled={
                    pictureEditorBusy
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--trackit-blue)] px-6 text-sm font-bold text-white transition hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isApplyingPicture
                    ? "Saving photo..."
                    : "Apply photo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

