import { Link } from "react-router-dom";

const privacySections = [
  {
    number: "01",
    title: "Information you provide",
    description:
      "When you use TrackIt, you may provide information needed to create and manage your account, reports, claims, profile, and other platform activity.",
    points: [
      "Account information such as your name, email address, and authentication details.",
      "Information included in lost and found item reports.",
      "Information submitted as part of claims, comments, reports, or support requests.",
    ],
  },
  {
    number: "02",
    title: "Information generated through use",
    description:
      "TrackIt may maintain information associated with actions you take on the platform so that features can work correctly and important activity can be managed.",
    points: [
      "Item, claim, comment, notification, and match activity associated with your account.",
      "Account and security state needed to protect access to the platform.",
      "Relevant administrative or moderation records where platform management requires them.",
    ],
  },
  {
    number: "03",
    title: "How information is used",
    description:
      "Information should be used for purposes connected to providing, securing, and improving TrackIt rather than collected without a meaningful reason.",
    points: [
      "Providing account and lost-and-found functionality.",
      "Supporting claims, verification, moderation, and communication workflows.",
      "Protecting accounts, maintaining platform security, and responding to support requests.",
    ],
  },
  {
    number: "04",
    title: "Information sharing",
    description:
      "TrackIt is designed to avoid unnecessarily exposing personal information. Information may be visible to other users where that visibility is part of a platform feature or necessary for an interaction.",
    points: [
      "Only share information in reports that is appropriate for the situation.",
      "Avoid publishing passwords, financial information, identification numbers, or unnecessary private details.",
      "Use the platform's available privacy and account controls where applicable.",
    ],
  },
];

const userRights = [
  {
    title: "Review your information",
    description:
      "Use the account and profile features available to review information associated with your TrackIt account.",
  },
  {
    title: "Keep information accurate",
    description:
      "Where editing is supported, update account or profile information when it changes.",
  },
  {
    title: "Control what you share",
    description:
      "Think carefully about the information included in public-facing reports and communication.",
  },
  {
    title: "Ask for help",
    description:
      "Contact TrackIt support when you have questions about your account or how information is handled.",
  },
];

export function PrivacyPage() {
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
              TrackIt Privacy
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight !text-white sm:text-5xl lg:text-6xl">
              Your information should be handled with care.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 !text-[var(--trackit-text-on-dark)] sm:text-lg">
              This page explains the main ways information can be involved in
              using TrackIt and the principles behind how the platform is
              designed to handle it.
            </p>
          </div>
        </div>
      </section>

      <main>
        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-5xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Privacy overview
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Information is part of making TrackIt work.
              </h2>

              <p className="mt-5 text-base leading-8 text-[var(--trackit-text-muted)]">
                TrackIt needs certain information to provide accounts, item
                reports, claims, notifications, moderation, security, and
                support. The goal is to use information for legitimate platform
                purposes while avoiding unnecessary exposure.
              </p>
            </div>

            <div className="mt-12 space-y-6">
              {privacySections.map((section) => (
                <article
                  key={section.number}
                  className="rounded-3xl border border-[var(--trackit-border)] bg-white p-6 shadow-sm sm:p-8"
                >
                  <div className="flex gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--trackit-navy)] text-sm font-extrabold text-white">
                      {section.number}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xl font-extrabold text-[var(--trackit-navy)]">
                        {section.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
                        {section.description}
                      </p>

                      <ul className="mt-5 space-y-3">
                        {section.points.map((point) => (
                          <li
                            key={point}
                            className="flex gap-3 text-sm leading-7 text-[var(--trackit-navy)]"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--trackit-blue)]"
                            />

                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--trackit-surface-blue)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Your role
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Privacy also depends on what you choose to share.
              </h2>

              <p className="mt-5 text-base leading-8 text-[var(--trackit-text-muted)]">
                TrackIt can provide controls and safeguards, but users should
                also consider whether information belongs in a report,
                comment, claim, or conversation before submitting it.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {userRights.map((right) => (
                <article
                  key={right.title}
                  className="rounded-2xl border border-[var(--trackit-border)] bg-white p-6"
                >
                  <h3 className="text-lg font-extrabold text-[var(--trackit-navy)]">
                    {right.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
                    {right.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Account security
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Protect the account that protects your reports.
              </h2>
            </div>

            <div className="rounded-3xl bg-[var(--trackit-navy)] p-6 shadow-xl sm:p-8">
              <p className="text-base leading-8 !text-[var(--trackit-text-on-dark)]">
                Keep your password private, use account recovery tools when
                necessary, and contact TrackIt support if you believe someone
                else may have accessed your account.
              </p>

              <Link
                to="/safety"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-5 text-sm font-bold !text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-navy)]"
              >
                Review Safety Guidance
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <div className="mx-auto w-full max-w-4xl rounded-[2rem] bg-[var(--trackit-midnight)] px-6 py-12 text-center sm:px-10 sm:py-16">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
              Questions about privacy?
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight !text-white sm:text-4xl">
              Contact TrackIt if you need clarification.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 !text-[var(--trackit-text-on-dark)]">
              If you have a question about your account or how information is
              handled, contact TrackIt support for assistance.
            </p>

            <Link
              to="/contact"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-6 text-sm font-bold !text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-midnight)]"
            >
              Contact TrackIt
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}