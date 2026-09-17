export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-[var(--trackit-midnight)] px-6"
    >
      <div className="flex flex-col items-center text-center">
        <div
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--trackit-blue-dark)] border-t-[var(--trackit-blue-bright)]"
        />

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--trackit-blue-bright)]">
          TrackIt
        </p>

        <p className="mt-2 text-sm text-[var(--trackit-text-on-dark)]">
          Preparing your experience…
        </p>
      </div>
    </div>
  );
}
