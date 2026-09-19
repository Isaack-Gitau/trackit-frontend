import { Link } from "react-router-dom";

export function FinalCtaSection() {
  return (
    <section className="bg-[var(--trackit-surface)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--trackit-dark-card)] px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 h-48 w-48 rounded-full bg-[var(--trackit-blue)]/20 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[var(--trackit-blue-bright)]/10 blur-3xl"
          />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
              Ready when you are
            </p>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight !text-[var(--trackit-dark-card-text)] sm:text-4xl lg:text-5xl">
              Give your lost or found item a place to be discovered.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 !text-[var(--trackit-dark-card-muted)] sm:text-lg">
              Create a structured post and use TrackIt&apos;s discovery and
              verification process to help move belongings toward the right
              people.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/items/post-lost"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-6 text-sm font-bold !text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-dark-card)]"
              >
                Post a lost item
              </Link>

              <Link
                to="/items/post-found"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--trackit-blue-dark)] px-6 text-sm font-bold !text-white transition-colors hover:bg-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-dark-card)]"
              >
                Post a found item
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

