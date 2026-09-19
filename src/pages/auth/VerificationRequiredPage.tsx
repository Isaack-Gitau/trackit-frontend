import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/Button";

type VerificationLocationState = {
  email?: string;
};

export function VerificationRequiredPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as VerificationLocationState | null;
  const email = state?.email ?? "";

  return (
    <main className="min-h-screen bg-[var(--trackit-surface)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-xl">
          <div className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--trackit-blue-soft)] text-2xl text-[var(--trackit-blue)]">
              ✉
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
              Verification required
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
              Verify your email to continue
            </h1>

            <p className="mt-4 text-base leading-7 text-[var(--trackit-text-muted)]">
              Your TrackIt account needs to be verified before you can sign in
              and use protected features.
            </p>

            {email ? (
              <div className="mt-6 rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface-blue)] p-4">
                <p className="text-sm text-[var(--trackit-text-muted)]">
                  Account email
                </p>

                <p className="mt-1 break-all font-semibold text-[var(--trackit-navy)]">
                  {email}
                </p>
              </div>
            ) : null}

            <div className="mt-8 space-y-3">
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                className="!text-white"
                onClick={() =>
                  navigate("/verify-email", {
                    state: email ? { email } : undefined,
                  })
                }
              >
                Verify my email
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                className="!text-white"
                onClick={() => navigate("/sign-in")}
              >
                Back to sign in
              </Button>
            </div>

            <div className="mt-8 border-t border-[var(--trackit-border)] pt-6 text-center">
              <p className="text-sm text-[var(--trackit-text-muted)]">
                Need help with verification?
              </p>

              <Link
                to="/help"
                className="mt-2 inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-bold text-[var(--trackit-blue)] hover:text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                Visit the Help Center
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
