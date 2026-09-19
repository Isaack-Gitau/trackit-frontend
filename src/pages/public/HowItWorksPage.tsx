import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Post",
    description:
      "Create a structured lost or found item post with the details that help TrackIt understand what happened.",
    details: [
      "Describe the item clearly.",
      "Add relevant dates and locations.",
      "Upload useful photos or other evidence when appropriate.",
    ],
  },
  {
    number: "02",
    title: "Discover",
    description:
      "Use organized posts to identify items that may be connected to what you lost or found.",
    details: [
      "Review relevant item information.",
      "Compare meaningful details rather than relying on a single similarity.",
      "Keep sensitive information private until it is appropriate to share.",
    ],
  },
  {
    number: "03",
    title: "Verify",
    description:
      "A possible match is not automatically proof of ownership. TrackIt uses the claim process to support verification.",
    details: [
      "Submit a claim when you believe an item belongs to you.",
      "Provide information that can support your claim.",
      "Allow the appropriate review process to take place.",
    ],
  },
  {
    number: "04",
    title: "Return",
    description:
      "Once the relevant parties and information have been verified, the goal is a responsible return.",
    details: [
      "Communicate through appropriate channels.",
      "Avoid unnecessarily exposing personal information.",
      "Arrange a sensible and safe handover.",
    ],
  },
];

export function HowItWorksPage() {
  return (
    <div className="bg-[var(--trackit-surface)]">
      <section className="relative overflow-hidden bg-[var(--trackit-midnight)] text-white">
        <div
          aria-hidden="true"
          className="absolute -left-32 top-[-10rem] h-96 w-96 rounded-full bg-[var(--trackit-blue)]/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute right-[-12rem] top-20 h-[32rem] w-[32rem] rounded-full bg-[var(--trackit-blue-bright)]/10 blur-3xl"
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
              How TrackIt works
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              A structured path from lost to found.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--trackit-text-on-dark)] sm:text-lg">
              TrackIt organizes the journey around four connected stages:
              posting an item, discovering relevant posts, verifying
              ownership, and working toward a responsible return.
            </p>
          </div>
        </div>
      </section>

      <main>
        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                The TrackIt process
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Four stages, one clear journey.
              </h2>

              <p className="mt-4 text-base leading-8 text-[var(--trackit-text-muted)]">
                Each stage has a different purpose. Posting creates useful
                information, discovery helps identify possibilities,
                verification helps establish ownership, and the return stage
                focuses on getting the item back responsibly.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--trackit-dark-card)] text-sm font-extrabold text-[var(--trackit-dark-card-text)]">
                      {step.number}
                    </div>

                    <div>
                      <h3 className="text-xl font-extrabold text-[var(--trackit-navy)]">
                        {step.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-6 space-y-3 border-t border-[var(--trackit-border)] pt-6">
                    {step.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex gap-3 text-sm leading-6 text-[var(--trackit-navy)]"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--trackit-blue)]"
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--trackit-surface-blue)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Verification matters
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Finding a possible match is only the beginning.
              </h2>
            </div>

            <div className="rounded-3xl bg-[var(--trackit-dark-card)] p-6 text-[var(--trackit-dark-card-text)] shadow-xl sm:p-8">
              <p className="text-base leading-8 text-[var(--trackit-dark-card-muted)]">
                A description, photograph, or apparent similarity should not
                automatically establish ownership. TrackIt&apos;s claim and
                review processes are designed to create a clearer path between
                identifying a possible item and establishing who should receive
                it.
              </p>

              <Link
                to="/safety"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-dark-card)]"
              >
                Read our safety guidance
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-4xl rounded-[2rem] bg-[var(--trackit-midnight)] px-6 py-12 text-center sm:px-10 sm:py-16">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
              Ready to get started?
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight !text-white sm:text-4xl">
              Give your lost or found item a structured place to start.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--trackit-text-on-dark)]">
              Create your TrackIt account to access the platform and begin
              posting, discovering, and managing your lost-and-found
              activity.
            </p>

            <Link
              to="/register"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-midnight)]"
            >
              Start with TrackIt
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}