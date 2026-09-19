import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Report",
    description:
      "Describe what was lost or found with useful details such as location, time, category, and identifying information.",
    to: "/items/report-lost",
    linkLabel: "Report an item",
  },
  {
    number: "02",
    title: "Discover",
    description:
      "Browse and search relevant reports to see whether an item matching yours has already been reported.",
    to: "/discover",
    linkLabel: "Explore reports",
  },
  {
    number: "03",
    title: "Verify",
    description:
      "Use meaningful identifying details and the TrackIt claim process to help establish that an item belongs to you.",
    to: "/how-it-works",
    linkLabel: "Learn about verification",
  },
  {
    number: "04",
    title: "Return",
    description:
      "Once the right people and information are connected, TrackIt helps guide the process toward a responsible return.",
    to: "/safety",
    linkLabel: "View safety guidance",
  },
];

export function ProcessSection() {
  return (
    <section className="bg-[var(--trackit-surface)] py-16 text-[var(--trackit-text)] sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
          <div className="max-w-xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
              How TrackIt works
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[var(--trackit-text)] lg:text-5xl">
              From a missing item to a clearer path home.
            </h2>

            <p className="mt-5 text-base font-semibold leading-8 text-[var(--trackit-text-muted)] sm:text-lg">
              TrackIt organizes the journey around four practical steps,
              helping people move from a report to a potential return without
              relying on scattered posts or guesswork.
            </p>

            <Link
              to="/how-it-works"
              className="mt-7 inline-flex min-h-11 items-center rounded-lg border border-[var(--trackit-border)] bg-[var(--trackit-surface)] px-5 text-sm font-extrabold text-[var(--trackit-text)] shadow-sm transition-colors hover:border-[var(--trackit-blue)] hover:text-[var(--trackit-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              See how TrackIt works
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {steps.map((step) => (
              <article
                key={step.number}
                className="group rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--trackit-blue)] hover:shadow-md sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-[var(--trackit-blue-soft)] px-2 text-xs font-black tracking-[0.08em] text-[var(--trackit-blue)]">
                    {step.number}
                  </span>

                  <span
                    aria-hidden="true"
                    className="mt-1 h-2 w-2 rounded-full bg-[var(--trackit-blue)] opacity-60 transition-opacity group-hover:opacity-100"
                  />
                </div>

                <h3 className="mt-7 text-xl font-black text-[var(--trackit-text)]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm font-semibold leading-7 text-[var(--trackit-text-muted)]">
                  {step.description}
                </p>

                <Link
                  to={step.to}
                  className="mt-5 inline-flex min-h-9 items-center rounded-md text-sm font-extrabold text-[var(--trackit-blue)] transition-colors hover:text-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
                >
                  {step.linkLabel}
                  <span
                    aria-hidden="true"
                    className="ml-1.5 transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
