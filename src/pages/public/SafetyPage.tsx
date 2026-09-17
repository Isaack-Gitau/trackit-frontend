import { Link } from "react-router-dom";

const principles = [
  {
    number: "01",
    title: "Share only what helps",
    description:
      "Include enough information to identify and manage a report, but avoid publishing unnecessary personal or sensitive information.",
  },
  {
    number: "02",
    title: "Treat matches as possibilities",
    description:
      "A similar description or photograph does not automatically prove ownership. Use the claim and verification process before treating an item as yours.",
  },
  {
    number: "03",
    title: "Verify before returning",
    description:
      "When an item appears to match a claim, the relevant details should be considered before arranging a handover.",
  },
  {
    number: "04",
    title: "Keep communication responsible",
    description:
      "Be respectful when communicating about a lost or found item and avoid sharing private information unnecessarily.",
  },
];

const safetyGuidelines = [
  {
    title: "Protect personal information",
    description:
      "Avoid publishing phone numbers, home addresses, passwords, financial information, identification numbers, or other sensitive details in item descriptions or public communication.",
  },
  {
    title: "Use meaningful item details",
    description:
      "Describe details that can help distinguish an item from similar belongings. Where appropriate, keep some identifying information private so it can help with later verification.",
  },
  {
    title: "Be careful with claims",
    description:
      "If you believe an item belongs to you, provide information that supports your claim rather than relying only on a photograph or general description.",
  },
  {
    title: "Choose handovers carefully",
    description:
      "When a return is appropriate, consider a safe and practical meeting arrangement. Avoid unnecessary risk when exchanging belongings with someone you do not know.",
  },
  {
    title: "Report suspicious activity",
    description:
      "If an interaction, claim, or report appears suspicious or inappropriate, use the available reporting and moderation channels rather than escalating the situation yourself.",
  },
  {
    title: "Respect other users",
    description:
      "Lost-and-found situations can be stressful. Keep communication factual and respectful, and do not harass, threaten, or pressure another person.",
  },
];

export function SafetyPage() {
  return (
    <div className="bg-[var(--trackit-surface)]">
      <section className="relative overflow-hidden bg-[var(--trackit-midnight)] text-white">
        <div
          aria-hidden="true"
          className="absolute -left-32 top-[-10rem] h-96 w-96 rounded-full bg-[var(--trackit-blue)]/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute right-[-12rem] top-16 h-[32rem] w-[32rem] rounded-full bg-[var(--trackit-blue-bright)]/10 blur-3xl"
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
              TrackIt safety
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight !text-white sm:text-5xl lg:text-6xl">
              Find and return belongings responsibly.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 !text-[var(--trackit-text-on-dark)] sm:text-lg">
              TrackIt is built around reporting, discovery, verification, and
              responsible returns. Good outcomes depend on both the platform
              and the people using it.
            </p>
          </div>
        </div>
      </section>

      <main>
        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Four principles
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Safety starts with how information is handled.
              </h2>

              <p className="mt-4 text-base leading-8 text-[var(--trackit-text-muted)]">
                Lost-and-found interactions involve real belongings and real
                people. These principles help keep reports useful while
                reducing unnecessary exposure and confusion.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {principles.map((principle) => (
                <article
                  key={principle.number}
                  className="rounded-3xl border border-[var(--trackit-border)] bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--trackit-navy)] text-sm font-extrabold text-white">
                    {principle.number}
                  </div>

                  <h3 className="mt-6 text-xl font-extrabold text-[var(--trackit-navy)]">
                    {principle.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
                    {principle.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--trackit-surface-blue)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Practical guidance
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Before you report, claim, or arrange a return.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {safetyGuidelines.map((guideline) => (
                <article
                  key={guideline.title}
                  className="rounded-2xl border border-[var(--trackit-border)] bg-white p-6"
                >
                  <h3 className="text-lg font-extrabold text-[var(--trackit-navy)]">
                    {guideline.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
                    {guideline.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Verification
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                A possible match is not the same as confirmed ownership.
              </h2>
            </div>

            <div className="rounded-3xl bg-[var(--trackit-midnight)] p-6 shadow-xl sm:p-8">
              <p className="text-base leading-8 !text-[var(--trackit-text-on-dark)]">
                TrackIt&apos;s claim and review workflows are intended to
                provide a more structured way to establish ownership. Users
                should avoid assuming that an item belongs to them solely
                because its appearance or description seems similar.
              </p>

              <Link
                to="/how-it-works"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-midnight)]"
              >
                See how TrackIt works
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="mx-auto w-full max-w-4xl rounded-[2rem] bg-[var(--trackit-navy)] px-6 py-12 text-center sm:px-10 sm:py-16">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
              Need help?
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight !text-white sm:text-4xl">
              If something feels wrong, take a step back.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 !text-[var(--trackit-text-on-dark)]">
              Do not share more information than necessary or feel pressured
              into a return. Use TrackIt&apos;s reporting and support channels
              when you need help with an interaction.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/help"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-navy)]"
              >
                Visit Help
              </Link>

              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 text-sm font-bold !text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-navy)]"
              >
                Contact TrackIt
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
