import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";

import { requestPasswordReset } from "../../api/auth";
import { ApiError } from "../../api/errors";
import { Button } from "../../components/ui/Button";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string): boolean {
  return (
    value.length > 0 &&
    value.length <= 255 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

function getResetErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "We could not process your request right now. Please try again.";
  }

  if (error.status === 422) {
    return "Please enter a valid email address.";
  }

  if (error.status === 429) {
    return "Too many password-reset requests. Please wait a moment and try again.";
  }

  if (error.status >= 500) {
    return "TrackIt is temporarily unable to process your request. Please try again shortly.";
  }

  return (
    error.message ||
    "We could not process your request right now. Please try again."
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedEmail = normalizeEmail(email);
  const emailIsValid = isValidEmail(normalizedEmail);

  function handleEmailChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setEmail(event.target.value);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!emailIsValid) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset({
        email: normalizedEmail,
      });

      setSuccessMessage(response.message);
      setEmail("");
    } catch (error) {
      setErrorMessage(getResetErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

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
                Account recovery
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight xl:text-5xl">
                Get back into your TrackIt account.
              </h1>

              <p className="mt-6 text-base leading-8 text-[var(--trackit-text-on-dark)]">
                Enter the email address associated with your account
                and TrackIt will send password-reset instructions when
                appropriate.
              </p>
            </div>
          </div>

          <div className="max-w-md rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-sm font-semibold text-white">
              Your account stays private
            </p>

            <p className="mt-1 text-sm leading-6 text-white/60">
              TrackIt uses the same response whether or not an
              account is associated with the email address you enter.
            </p>
          </div>
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
                Forgot password
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--trackit-navy)]">
                Reset your password
              </h2>

              <p className="mt-3 text-[var(--trackit-text-muted)]">
                Enter your email address and we&apos;ll send you a
                secure password-reset link if an account is associated
                with it.
              </p>
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="mt-7 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800"
              >
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div
                role="status"
                className="mt-7 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-800"
              >
                {successMessage}
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
              noValidate
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[var(--trackit-navy)]"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  maxLength={255}
                  disabled={isSubmitting}
                  className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                  placeholder="you@example.com"
                  aria-invalid={
                    email.length > 0 && !emailIsValid
                  }
                />

                {email.length > 0 && !emailIsValid ? (
                  <p className="mt-2 text-xs leading-5 text-red-700">
                    Enter a valid email address.
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={!emailIsValid}
                className="!text-white"
              >
                Send reset link
              </Button>
            </form>

            <div className="mt-8 border-t border-[var(--trackit-border)] pt-7 text-center">
              <Link
                to="/sign-in"
                className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                Back to sign in
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-[var(--trackit-text-muted)]">
              Don&apos;t have a TrackIt account?{" "}
              <Link
                to="/register"
                className="font-bold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                Create one
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

