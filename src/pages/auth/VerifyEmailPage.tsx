import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  resendVerification,
  verifyEmail,
} from "../../api/auth";
import { ApiError } from "../../api/errors";
import { Button } from "../../components/ui/Button";

type VerificationState = {
  status: "verifying" | "success" | "error" | "ready";
  message: string;
};

/*
 * React Strict Mode can run an effect more than once during development.
 *
 * TrackIt verification tokens are intentionally single-use, so two
 * simultaneous requests for the same token would cause the first request
 * to succeed and the second request to receive a 400 response.
 *
 * Keep the currently running verification request in memory so repeated
 * effects reuse the same request instead of sending another one.
 */
const verificationRequests = new Map<
  string,
  Promise<void>
>();

function getVerificationErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "We could not verify your email right now. Please try again.";
  }

  if (error.status === 400) {
    return "This verification link is invalid or has expired. Request a new verification email below.";
  }

  if (error.status === 429) {
    return "Too many verification attempts. Please wait a while before trying again.";
  }

  if (error.status >= 500) {
    return "TrackIt is temporarily unable to verify your email. Please try again shortly.";
  }

  return "We could not verify your email right now. Please try again.";
}

function getResendErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "We could not send the verification email right now. Please try again.";
  }

  if (error.status === 429) {
    return "Too many requests. Please wait a while before requesting another verification email.";
  }

  if (error.status >= 500) {
    return "TrackIt is temporarily unable to send the verification email. Please try again shortly.";
  }

  return "We could not send the verification email right now. Please try again.";
}

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token")?.trim() ?? "";

  const registrationEmail =
    typeof location.state?.email === "string"
      ? location.state.email
      : "";

  const [email, setEmail] = useState(registrationEmail);
  const [verification, setVerification] =
    useState<VerificationState>({
      status: token ? "verifying" : "ready",
      message: "",
    });

  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setVerification({
        status: "ready",
        message:
          "Open the verification link from your TrackIt email, or request a new verification email below.",
      });

      return;
    }

    let cancelled = false;

    setVerification({
      status: "verifying",
      message: "Verifying your email address...",
    });

    let verificationRequest =
      verificationRequests.get(token);

    if (!verificationRequest) {
      verificationRequest = verifyEmail({ token }).then(
        () => undefined,
      );

      verificationRequests.set(
        token,
        verificationRequest,
      );

      void verificationRequest.finally(() => {
        if (
          verificationRequests.get(token) ===
          verificationRequest
        ) {
          verificationRequests.delete(token);
        }
      });
    }

    async function completeVerification() {
      try {
        await verificationRequest;

        if (cancelled) {
          return;
        }

        setVerification({
          status: "success",
          message:
            "Your email has been verified successfully. You can now sign in to your TrackIt account.",
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setVerification({
          status: "error",
          message: getVerificationErrorMessage(error),
        });
      }
    }

    void completeVerification();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleResend(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setResendMessage("");
    setResendError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setResendError(
        "Enter the email address you used to create your TrackIt account.",
      );
      return;
    }

    setIsResending(true);

    try {
      const response = await resendVerification({
        email: normalizedEmail,
      });

      setResendMessage(response.message);
    } catch (error) {
      setResendError(getResendErrorMessage(error));
    } finally {
      setIsResending(false);
    }
  }

  const isVerifying =
    verification.status === "verifying";

  const isVerified =
    verification.status === "success";

  return (
    <main className="min-h-screen bg-[var(--trackit-midnight)] px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/20 lg:grid-cols-[1fr_1.05fr]">
        <section className="hidden bg-[var(--trackit-deep-navy)] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div>
            <Link
              to="/"
              className="inline-flex rounded-lg text-2xl font-extrabold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              Track
              <span className="text-[var(--trackit-blue-bright)]">
                It
              </span>
            </Link>

            <div className="mt-20 max-w-md">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
                Account verification
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight xl:text-5xl">
                One quick step before you get started.
              </h1>

              <p className="mt-6 text-base leading-8 text-[var(--trackit-text-on-dark)]">
                Verify your email address to protect your
                account and unlock TrackIt sign-in.
              </p>
            </div>
          </div>

          <p className="max-w-md text-sm leading-6 text-white/60">
            Verification links are single-use and expire
            for your security.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-10 lg:p-12 xl:p-14">
          <div className="mx-auto w-full max-w-md">
            <div className="lg:hidden">
              <Link
                to="/"
                className="inline-flex rounded-lg text-xl font-extrabold tracking-tight text-[var(--trackit-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                Track
                <span className="text-[var(--trackit-blue)]">
                  It
                </span>
              </Link>
            </div>

            <div className="mt-8 lg:mt-0">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--trackit-blue)]">
                Verify email
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--trackit-navy)]">
                Verify your email address
              </h2>

              <p className="mt-3 text-[var(--trackit-text-muted)]">
                We sent a verification link to your email
                address. Open that message and follow the link
                to verify your TrackIt account.
              </p>
            </div>

            {isVerifying ? (
              <div className="mt-8 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6">
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-1 h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-[var(--trackit-blue)] border-r-transparent"
                  />

                  <div>
                    <h3 className="font-semibold text-[var(--trackit-navy)]">
                      Verifying your email
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-muted)]">
                      Please wait while TrackIt confirms your
                      verification link.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {isVerified ? (
              <div
                role="status"
                className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6"
              >
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
                  >
                    ✓
                  </span>

                  <div>
                    <h3 className="font-semibold text-emerald-900">
                      Email verified
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-emerald-800">
                      {verification.message}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-6 !text-white"
                  onClick={() =>
                    navigate("/sign-in", {
                      replace: true,
                    })
                  }
                >
                  Continue to sign in
                </Button>
              </div>
            ) : null}

            {verification.status === "error" ? (
              <div
                role="alert"
                className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5"
              >
                <h3 className="font-semibold text-red-900">
                  Verification unsuccessful
                </h3>

                <p className="mt-1 text-sm leading-6 text-red-800">
                  {verification.message}
                </p>
              </div>
            ) : null}

            {verification.status === "ready" ? (
              <div
                role="status"
                className="mt-8 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5"
              >
                <h3 className="font-semibold text-[var(--trackit-navy)]">
                  Check your inbox
                </h3>

                <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-muted)]">
                  {verification.message}
                </p>
              </div>
            ) : null}

            {!isVerified ? (
              <form
                onSubmit={handleResend}
                className="mt-8 space-y-5"
                noValidate
              >
                <div>
                  <label
                    htmlFor="verification-email"
                    className="block text-sm font-semibold text-[var(--trackit-navy)]"
                  >
                    Email address
                  </label>

                  <input
                    id="verification-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setResendMessage("");
                      setResendError("");
                    }}
                    required
                    maxLength={255}
                    disabled={isResending}
                    className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                    placeholder="you@example.com"
                  />
                </div>

                {resendError ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
                  >
                    {resendError}
                  </div>
                ) : null}

                {resendMessage ? (
                  <div
                    role="status"
                    className="rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-blue-soft)] px-4 py-3 text-sm leading-6 text-[var(--trackit-navy)]"
                  >
                    {resendMessage}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  loading={isResending}
                  className="!text-white"
                >
                  Resend verification email
                </Button>
              </form>
            ) : null}

            {!isVerified ? (
              <div className="mt-8 border-t border-[var(--trackit-border)] pt-7 text-center">
                <p className="text-sm text-[var(--trackit-text-muted)]">
                  Already verified your account?
                </p>

                <Link
                  to="/sign-in"
                  className="mt-2 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold text-[var(--trackit-blue)] hover:text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  Sign in
                </Link>
              </div>
            ) : null}

            <p className="mt-8 text-center text-xs leading-5 text-[var(--trackit-text-muted)]">
              Need help? Visit our{" "}
              <Link
                to="/help"
                className="font-semibold text-[var(--trackit-blue)] hover:text-[var(--trackit-blue-hover)]"
              >
                Help Center
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

