import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../../api/auth";
import { ApiError } from "../../api/errors";
import { Button } from "../../components/ui/Button";

type PasswordRequirement = {
  label: string;
  valid: boolean;
};

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function isValidName(value: string): boolean {
  if (value.length < 1 || value.length > 100) {
    return false;
  }

  return /^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u.test(value);
}

function getApiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return "We could not create your account right now. Please try again.";
  }

  if (error.status === 409) {
    return "That username or email address is already in use.";
  }

  if (error.status === 422) {
    return "Please check your details and make sure they meet the required format.";
  }

  if (error.status === 503) {
    return "Your account was created, but we could not send the verification email. Please use the resend option on the verification page.";
  }

  if (error.status >= 500) {
    return "TrackIt is temporarily unable to create your account. Please try again shortly.";
  }

  return "We could not create your account right now. Please check your details and try again.";
}

export function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRequirements = useMemo<PasswordRequirement[]>(
    () => [
      {
        label: "8–128 characters",
        valid: password.length >= 8 && password.length <= 128,
      },
      {
        label: "One uppercase letter",
        valid: /[A-Z]/.test(password),
      },
      {
        label: "One lowercase letter",
        valid: /[a-z]/.test(password),
      },
      {
        label: "One number",
        valid: /\d/.test(password),
      },
      {
        label: "One special character",
        valid: /[^A-Za-z0-9]/.test(password),
      },
    ],
    [password],
  );

  const passwordIsValid = passwordRequirements.every(
    (requirement) => requirement.valid,
  );

  const normalizedUsername = normalizeUsername(username);
  const normalizedFirstName = normalizeName(firstName);
  const normalizedLastName = normalizeName(lastName);
  const normalizedEmail = normalizeEmail(email);

  const usernameIsValid =
    normalizedUsername.length >= 3 &&
    normalizedUsername.length <= 50 &&
    /^[A-Za-z][A-Za-z0-9_-]*$/.test(normalizedUsername);

  const emailIsValid =
    normalizedEmail.length <= 255 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  const firstNameIsValid = isValidName(normalizedFirstName);
  const lastNameIsValid = isValidName(normalizedLastName);

  const namesAreValid =
    firstNameIsValid && lastNameIsValid;

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const formIsValid =
    namesAreValid &&
    usernameIsValid &&
    emailIsValid &&
    passwordIsValid &&
    passwordsMatch &&
    termsAccepted;

  function handleTextChange(
    setter: (value: string) => void,
  ) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
      setErrorMessage("");
    };
  }

  function handleTermsChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setTermsAccepted(event.target.checked);
    setErrorMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (!formIsValid) {
      setErrorMessage(
        "Please correct the highlighted requirements before continuing.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        username: normalizedUsername,
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        email: normalizedEmail,
        password,
      });

      navigate("/verify-email", {
        replace: true,
        state: {
          email: normalizedEmail,
          registered: true,
        },
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
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
                Get started
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-tight xl:text-5xl">
                Create your TrackIt account.
              </h1>

              <p className="mt-6 text-base leading-8 text-[var(--trackit-text-on-dark)]">
                Join TrackIt to report lost or found items, follow
                claims, discover possible matches, and stay informed
                throughout the return process.
              </p>
            </div>
          </div>

          <p className="max-w-md text-sm leading-6 text-white/60">
            Every new TrackIt account starts as a regular community
            account. Elevated moderator and administrator access is
            managed separately.
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
                Create account
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[var(--trackit-navy)]">
                Join the TrackIt community
              </h2>

              <p className="mt-3 text-[var(--trackit-text-muted)]">
                Create a regular TrackIt account to get started.
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

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
              noValidate
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="first-name"
                    className="block text-sm font-semibold text-[var(--trackit-navy)]"
                  >
                    First name
                  </label>

                  <input
                    id="first-name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={handleTextChange(setFirstName)}
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                    className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                    placeholder="John"
                    aria-invalid={
                      firstName.length > 0 && !firstNameIsValid
                    }
                  />

                  {firstName.length > 0 && !firstNameIsValid ? (
                    <p className="mt-2 text-xs leading-5 text-red-700">
                      Use letters, spaces, hyphens, or apostrophes only.
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor="last-name"
                    className="block text-sm font-semibold text-[var(--trackit-navy)]"
                  >
                    Last name
                  </label>

                  <input
                    id="last-name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={handleTextChange(setLastName)}
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                    className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                    placeholder="Doe"
                    aria-invalid={
                      lastName.length > 0 && !lastNameIsValid
                    }
                  />

                  {lastName.length > 0 && !lastNameIsValid ? (
                    <p className="mt-2 text-xs leading-5 text-red-700">
                      Use letters, spaces, hyphens, or apostrophes only.
                    </p>
                  ) : null}
                </div>
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-[var(--trackit-navy)]"
                >
                  Username
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={handleTextChange(setUsername)}
                  required
                  minLength={3}
                  maxLength={50}
                  disabled={isSubmitting}
                  className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                  placeholder="John_Doe"
                  aria-invalid={
                    username.length > 0 && !usernameIsValid
                  }
                />

                <p className="mt-2 text-xs leading-5 text-[var(--trackit-text-muted)]">
                  3–50 characters. Start with a letter and use only
                  letters, numbers, underscores, or hyphens.
                </p>
              </div>

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
                  value={email}
                  onChange={handleTextChange(setEmail)}
                  required
                  maxLength={255}
                  disabled={isSubmitting}
                  className="mt-2 min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                  placeholder="you@example.com"
                  aria-invalid={
                    email.length > 0 && !emailIsValid
                  }
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[var(--trackit-navy)]"
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={handleTextChange(setPassword)}
                    required
                    minLength={8}
                    maxLength={128}
                    disabled={isSubmitting}
                    className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 pr-24 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                    placeholder="Create a strong password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((visible) => !visible)
                    }
                    disabled={isSubmitting}
                    className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-3 text-sm font-semibold !text-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-50"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="mt-3 rounded-xl bg-[var(--trackit-surface)] p-4">
                  <p className="text-xs font-semibold text-[var(--trackit-navy)]">
                    Password requirements
                  </p>

                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {passwordRequirements.map((requirement) => (
                      <li
                        key={requirement.label}
                        className={`text-xs ${
                          requirement.valid
                            ? "text-emerald-700"
                            : "text-[var(--trackit-text-muted)]"
                        }`}
                      >
                        <span aria-hidden="true">
                          {requirement.valid ? "✓" : "•"}
                        </span>{" "}
                        {requirement.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-semibold text-[var(--trackit-navy)]"
                >
                  Confirm password
                </label>

                <div className="relative mt-2">
                  <input
                    id="confirm-password"
                    name="confirm_password"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={handleTextChange(
                      setConfirmPassword,
                    )}
                    required
                    minLength={8}
                    maxLength={128}
                    disabled={isSubmitting}
                    className="min-h-12 w-full rounded-xl border border-[var(--trackit-border)] bg-white px-4 pr-24 text-[var(--trackit-navy)] shadow-sm outline-none transition focus:border-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/20 disabled:cursor-not-allowed disabled:bg-slate-50"
                    placeholder="Enter your password again"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (visible) => !visible,
                      )
                    }
                    disabled={isSubmitting}
                    className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-3 text-sm font-semibold !text-[var(--trackit-blue)] hover:bg-[var(--trackit-blue-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] disabled:pointer-events-none disabled:opacity-50"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password confirmation"
                        : "Show password confirmation"
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {confirmPassword.length > 0 &&
                !passwordsMatch ? (
                  <p className="mt-2 text-xs font-medium text-red-700">
                    Passwords do not match.
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-4">
                <label
                  htmlFor="terms-accepted"
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id="terms-accepted"
                    name="terms_accepted"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={handleTermsChange}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded border-[var(--trackit-border)] text-[var(--trackit-blue)] accent-[var(--trackit-blue)] focus:ring-2 focus:ring-[var(--trackit-blue)]/30 disabled:cursor-not-allowed"
                  />

                  <span className="text-sm leading-6 text-[var(--trackit-text-muted)]">
                    I agree to the TrackIt{" "}
                    <Link
                      to="/terms"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[var(--trackit-blue)] underline-offset-2 hover:text-[var(--trackit-blue-hover)] hover:underline"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[var(--trackit-blue)] underline-offset-2 hover:text-[var(--trackit-blue-hover)] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={!formIsValid}
                className="!text-white"
              >
                Create account
              </Button>
            </form>

            <div className="mt-8 border-t border-[var(--trackit-border)] pt-7 text-center">
              <p className="text-sm text-[var(--trackit-text-muted)]">
                Already have a TrackIt account?
              </p>

              <Link
                to="/sign-in"
                className="mt-2 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold !text-[var(--trackit-blue)] hover:!text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-8 text-center text-xs leading-5 text-[var(--trackit-text-muted)]">
              TrackIt requires account registration so that users can
              securely report items, submit claims, and communicate
              during the return process.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

