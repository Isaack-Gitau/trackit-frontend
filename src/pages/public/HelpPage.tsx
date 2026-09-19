import { Link } from "react-router-dom";

const helpSections = [
  {
    title: "Getting started",
    items: [
      {
        question: "How do I start using TrackIt?",
        answer:
          "Create a TrackIt account and complete the required account verification steps. Once your account is ready, you can post items, discover relevant posts, manage claims, and use the other features available to your account.",
      },
      {
        question: "Why do I need to verify my email?",
        answer:
          "Email verification helps TrackIt confirm that an account is associated with a working email address and supports important account and security workflows.",
      },
      {
        question: "What happens if I cannot access my account?",
        answer:
          "Use the password recovery flow if you have forgotten your password. If you are still unable to access your account, contact TrackIt support for assistance.",
      },
    ],
  },
  {
    title: "Lost and found posts",
    items: [
      {
        question: "How do I post a lost item?",
        answer:
          "Use the lost-item posting flow and provide clear information about the item, when it was lost, and where relevant. Useful photos and identifying details can make a post more informative.",
      },
      {
        question: "How do I post something I found?",
        answer:
          "Use the found-item reporting flow and provide useful information about what you found and the circumstances surrounding it. Avoid publishing sensitive information that could unnecessarily expose you or another person.",
      },
      {
        question: "Can I update information in my post?",
        answer:
          "TrackIt provides item-management workflows for posts. The exact actions available can depend on the item's current status and your permissions.",
      },
    ],
  },
  {
    title: "Claims and verification",
    items: [
      {
        question: "What is a claim?",
        answer:
          "A claim is a request associated with an item that you believe belongs to you. It provides a structured way to present information that can help establish ownership.",
      },
      {
        question: "Does a matching photograph prove ownership?",
        answer:
          "No. A photograph or similar description can indicate a possible match, but it should not automatically be treated as proof of ownership. Relevant information should be considered through the claim and verification process.",
      },
      {
        question: "What happens after I submit a claim?",
        answer:
          "A claim can move through TrackIt's review workflow. Depending on the situation, the appropriate users or moderators may need to review the available information before the item can move toward a return.",
      },
    ],
  },
  {
    title: "Safety and communication",
    items: [
      {
        question: "What information should I avoid sharing?",
        answer:
          "Avoid publishing passwords, financial information, identification numbers, home addresses, or other sensitive personal information unless it is genuinely necessary for an appropriate support process.",
      },
      {
        question: "What should I do if an interaction feels unsafe?",
        answer:
          "Do not feel pressured to continue an interaction or arrange a handover. Step back, protect your personal information, and use TrackIt's available reporting, moderation, or support channels.",
      },
      {
        question: "Where can I read more safety guidance?",
        answer:
          "Visit the TrackIt Safety page for practical guidance about posts, claims, verification, communication, and returns.",
      },
    ],
  },
];

export function HelpPage() {
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
              TrackIt Help
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight !text-white sm:text-5xl lg:text-6xl">
              Find answers before you need to ask.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 !text-[var(--trackit-text-on-dark)] sm:text-lg">
              Get practical guidance about accounts, lost and found posts,
              claims, verification, communication, and safety.
            </p>
          </div>
        </div>
      </section>

      <main>
        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-5xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Common questions
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Guidance for the most important parts of TrackIt.
              </h2>

              <p className="mt-4 text-base leading-8 text-[var(--trackit-text-muted)]">
                As TrackIt grows, this section can expand alongside the
                platform. For now, these answers cover the core workflows and
                principles already built into the system.
              </p>
            </div>

            <div className="mt-12 space-y-8">
              {helpSections.map((section) => (
                <section
                  key={section.title}
                  className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8"
                >
                  <h3 className="text-xl font-extrabold text-[var(--trackit-navy)]">
                    {section.title}
                  </h3>

                  <div className="mt-6 divide-y divide-[var(--trackit-border)]">
                    {section.items.map((item) => (
                      <article
                        key={item.question}
                        className="py-6 first:pt-0 last:pb-0"
                      >
                        <h4 className="text-base font-bold text-[var(--trackit-navy)]">
                          {item.question}
                        </h4>

                        <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
                          {item.answer}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--trackit-surface-blue)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Still need help?
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                We can help you work through the problem.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-8 text-[var(--trackit-text-muted)]">
                If the guidance above does not answer your question, contact
                TrackIt support with a clear description of what you were
                trying to do and what happened.
              </p>
            </div>

            <div className="rounded-3xl bg-[var(--trackit-dark-card)] p-6 shadow-xl sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
                Support
              </p>

              <h3 className="mt-3 text-2xl font-extrabold !text-white">
                Contact TrackIt
              </h3>

              <p className="mt-3 text-sm leading-7 !text-[var(--trackit-dark-card-muted)]">
                Reach us through the available support channels for account,
                report, claim, or safety-related assistance.
              </p>

              <Link
                to="/contact"
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-6 text-sm font-bold !text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-dark-card)]"
              >
                Contact TrackIt
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="mx-auto w-full max-w-4xl rounded-[2rem] bg-[var(--trackit-midnight)] px-6 py-12 text-center sm:px-10 sm:py-16">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
              Safety first
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight !text-white sm:text-4xl">
              When in doubt, protect your information first.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 !text-[var(--trackit-text-on-dark)]">
              Read the TrackIt safety guidance before sharing information,
              submitting a claim, or arranging a return.
            </p>

            <Link
              to="/safety"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-6 text-sm font-bold !text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-midnight)]"
            >
              Read Safety Guidance
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}