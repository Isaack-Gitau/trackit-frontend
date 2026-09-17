import { Link, useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/Button";

export function AccountInactivePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-[var(--trackit-surface)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto w-full max-w-xl">
          <div className="rounded-3xl border border-[var(--trackit-border)] bg-white p-6 shadow-sm sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-700">
              !
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-amber-700">
              Account inactive
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
              Your TrackIt account is currently inactive.
            </h1>

            <p className="mt-4 text-base leading-7 text-[var(--trackit-text-muted)]">
              You cannot access protected TrackIt features while your account
              is inactive.
            </p>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-semibold text-amber-900">
                What you can do
              </h2>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                If your account was temporarily deactivated, access may be
                restored when the deactivation period ends. If you believe
                your account should be active, please contact TrackIt support.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                className="!text-white"
                onClick={() => navigate("/sign-in")}
              >
                Return to sign in
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                className="!text-white"
                onClick={() => navigate("/help")}
              >
                Get help
              </Button>
            </div>

            <div className="mt-8 border-t border-[var(--trackit-border)] pt-6 text-center">
              <p className="text-sm text-[var(--trackit-text-muted)]">
                You can also review the{" "}
                <Link
                  to="/help"
                  className="font-semibold text-[var(--trackit-blue)] hover:text-[var(--trackit-blue-hover)]"
                >
                  TrackIt Help Center
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
