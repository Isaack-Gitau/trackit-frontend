import { Link } from "react-router-dom";

const contactTopics = [
  {
    title: "Account support",
    description:
      "Get help with account access, email verification, password recovery, or an account that has become inactive.",
  },
  {
    title: "Post or claim support",
    description:
      "Ask for help when you are having trouble with a lost or found item post, claim, or related workflow.",
  },
  {
    title: "Safety concerns",
    description:
      "Contact TrackIt if an interaction, report, claim, or communication raises a safety or moderation concern.",
  },
  {
    title: "General questions",
    description:
      "Have a question about how TrackIt works or how a particular part of the platform is intended to be used?",
  },
];

export function ContactPage() {
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
              Contact TrackIt
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight !text-white sm:text-5xl lg:text-6xl">
              Need help with something on TrackIt?
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 !text-[var(--trackit-text-on-dark)] sm:text-lg">
              Reach out when you need assistance with an account, post,
              claim, safety concern, or general question about the platform.
            </p>
          </div>
        </div>
      </section>

      <main>
        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-start lg:gap-12">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Get in touch
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Choose the support channel that works for you.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--trackit-text-muted)]">
                For the current TrackIt support setup, you can reach us by
                email or WhatsApp. When contacting support, include enough
                information for us to understand the issue without sending
                unnecessary sensitive information.
              </p>

              <div className="mt-8 space-y-4">
                <a
                  href="mailto:isaackgofficial@gmail.com"
                  className="group block rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm transition-colors hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] sm:p-6"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                    Email support
                  </p>

                  <p className="mt-2 break-all text-base font-bold text-[var(--trackit-navy)] group-hover:text-[var(--trackit-blue)] sm:text-lg">
                    isaackgofficial@gmail.com
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    Best for account issues, detailed questions, and situations
                    that need more context.
                  </p>
                </a>

                <a
                  href="https://wa.me/254743570561"
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-5 shadow-sm transition-colors hover:border-[var(--trackit-blue)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] sm:p-6"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--trackit-blue)]">
                    WhatsApp
                  </p>

                  <p className="mt-2 text-base font-bold text-[var(--trackit-navy)] group-hover:text-[var(--trackit-blue)] sm:text-lg">
                    +254 743 570 561
                  </p>

                  <p className="mt-2 text-sm leading-6 text-[var(--trackit-text-muted)]">
                    A direct channel for support questions and assistance with
                    using the platform.
                  </p>
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[var(--trackit-dark-card)] p-6 shadow-xl sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
                What can we help with?
              </p>

              <div className="mt-6 space-y-4">
                {contactTopics.map((topic) => (
                  <article
                    key={topic.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <h3 className="text-base font-bold !text-white">
                      {topic.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 !text-[var(--trackit-text-on-dark)]">
                      {topic.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--trackit-surface-blue)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Before contacting support
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Keep your message useful and your information protected.
              </h2>

              <p className="mt-4 text-base leading-8 text-[var(--trackit-text-muted)]">
                Support requests are easier to handle when they explain the
                problem clearly. At the same time, you should avoid sending
                information that is not necessary to resolve the issue.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <GuidanceCard
                title="Explain the issue"
                description="Tell us what you were trying to do, what happened, and where you encountered the problem."
              />

              <GuidanceCard
                title="Include useful context"
                description="If a post or claim is involved, provide the relevant reference information when available."
              />

              <GuidanceCard
                title="Protect sensitive data"
                description="Do not send passwords, payment information, identification numbers, or other unnecessary sensitive details."
              />
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto grid w-full max-w-5xl gap-8 rounded-[2rem] bg-[var(--trackit-midnight)] px-6 py-12 text-center sm:px-10 sm:py-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
                Need immediate guidance?
              </p>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight !text-white sm:text-4xl">
                Start with the TrackIt help and safety guidance.
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 !text-[var(--trackit-text-on-dark)]">
                You may find the answer you need without contacting support.
                Review the available guidance for common questions and safer
                lost-and-found interactions.
              </p>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/help"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-6 text-sm font-bold !text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-midnight)]"
              >
                Visit Help
              </Link>

              <Link
                to="/safety"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 text-sm font-bold !text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-midnight)]"
              >
                Read Safety
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

type GuidanceCardProps = {
  title: string;
  description: string;
};

function GuidanceCard({
  title,
  description,
}: GuidanceCardProps) {
  return (
    <article className="rounded-2xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6">
      <h3 className="text-lg font-extrabold text-[var(--trackit-navy)]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
        {description}
      </p>
    </article>
  );
}