import { Link } from "react-router-dom";

const principles = [
  {
    title: "Structured",
    description:
      "Important item details are organized into posts instead of being scattered across unrelated posts.",
  },
  {
    title: "Community-focused",
    description:
      "TrackIt connects people who have lost belongings with people who may have found them.",
  },
  {
    title: "Verification-aware",
    description:
      "Claims and item information provide a structured path for checking ownership before a return.",
  },
];

export function AboutSection() {
  return (
    <section className="bg-[var(--trackit-surface)] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
              About TrackIt
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl lg:text-5xl">
              One place to organize the journey from lost to found.
            </h2>

            <p className="mt-5 text-base leading-8 text-[var(--trackit-text-muted)] sm:text-lg">
              TrackIt is a lost-and-found platform built around a simple idea:
              make it easier to post belongings, discover relevant items,
              verify ownership, and coordinate toward a responsible return.
            </p>

            <p className="mt-4 text-base leading-8 text-[var(--trackit-text-muted)] sm:text-lg">
              Instead of treating lost-and-found as a collection of
              disconnected conversations, TrackIt gives each post a
              structured place in the process.
            </p>

            <Link
              to="/about"
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--trackit-dark-card)] px-5 text-sm font-bold !text-[var(--trackit-dark-card-text)] transition-colors hover:bg-[var(--trackit-blue-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-surface)]"
            >
              Learn more about TrackIt
            </Link>
          </div>

          <div className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 sm:p-8">
            <div className="rounded-2xl bg-[var(--trackit-midnight)] p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
                The TrackIt approach
              </p>

              <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Built around the details that matter.
              </h3>

              <div className="mt-7 space-y-5">
                {principles.map((principle, index) => (
                  <div
                    key={principle.title}
                    className="flex gap-4 border-t border-white/10 pt-5 first:border-t-0 first:pt-0"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--trackit-blue)] text-xs font-extrabold text-white"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <h4 className="text-base font-bold text-white">
                        {principle.title}
                      </h4>

                      <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-on-dark)]">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}