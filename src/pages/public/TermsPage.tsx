import { Link } from "react-router-dom";

const termsSections = [
  {
    number: "01",
    title: "Using TrackIt",
    description:
      "TrackIt provides a structured platform for reporting lost and found items, discovering relevant reports, submitting claims, and communicating around potential returns.",
    points: [
      "Use TrackIt only for legitimate lost-and-found activity.",
      "Provide information that is accurate and not intentionally misleading.",
      "Use only the account that belongs to you and keep your login credentials private.",
    ],
  },
  {
    number: "02",
    title: "Reports and item information",
    description:
      "Reports help other users understand what has been lost or found. The information you submit can affect other people's decisions, so it should be provided carefully.",
    points: [
      "Do not knowingly submit false, fraudulent, or misleading item reports.",
      "Only include information that is appropriate to share on the platform.",
      "Do not use reports to publish passwords, financial information, identification numbers, or other unnecessary sensitive information.",
    ],
  },
  {
    number: "03",
    title: "Claims and verification",
    description:
      "A claim does not automatically establish ownership. TrackIt's claim and verification workflows are intended to help users and platform moderators evaluate potential matches responsibly.",
    points: [
      "Submit claims only when you have a legitimate reason to believe an item belongs to you.",
      "Provide truthful information when responding to verification requests.",
      "Do not pressure, threaten, impersonate, or deceive another user during a claim or return process.",
    ],
  },
  {
    number: "04",
    title: "Communication and conduct",
    description:
      "TrackIt is a community platform, and respectful communication is important when people are trying to recover or return property.",
    points: [
      "Communicate respectfully with other users, moderators, and support staff.",
      "Do not use TrackIt for harassment, threats, spam, scams, or unrelated commercial activity.",
      "Report suspicious or unsafe behavior through the available support and reporting channels.",
    ],
  },
  {
    number: "05",
    title: "Moderation and platform decisions",
    description:
      "TrackIt may use moderation and administrative processes to protect users, review reports, manage claims, and respond to activity that may violate platform rules.",
    points: [
      "Reports, claims, comments, and other activity may be reviewed where platform management requires it.",
      "TrackIt may restrict or deactivate accounts when platform rules or security requirements require action.",
      "Administrative and moderation decisions may be recorded as part of maintaining platform accountability and security.",
    ],
  },
  {
    number: "06",
    title: "Account security and availability",
    description:
      "You are responsible for taking reasonable steps to protect access to your account. TrackIt also uses account and security controls to protect the platform.",
    points: [
      "Keep your password and authentication information private.",
      "Contact TrackIt if you believe your account has been accessed without authorization.",
      "Platform features may change, become temporarily unavailable, or require maintenance as the service develops.",
    ],
  },
];

const responsibilities = [
  {
    title: "Be accurate",
    description:
      "Give truthful information when creating reports, claims, comments, and other platform activity.",
  },
  {
    title: "Respect others",
    description:
      "Treat people involved in lost-and-found interactions with respect and communicate responsibly.",
  },
  {
    title: "Protect your account",
    description:
      "Keep authentication details private and take action if you suspect unauthorized access.",
  },
  {
    title: "Use good judgment",
    description:
      "Avoid sharing unnecessary sensitive information and use appropriate care when arranging a return.",
  },
];

export function TermsPage() {
  return (
    <div className="bg-[var(--trackit-surface)]">
      <section className="relative overflow-hidden bg-[var(--trackit-midnight)] text-white">
        <div
          aria-hidden="true"
          className="absolute -right-32 top-[-10rem] h-96 w-96 rounded-full bg-[var(--trackit-blue)]/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute left-[-12rem] top-20 h-[32rem] w-[32rem] rounded-full bg-[var(--trackit-blue-bright)]/10 blur-3xl"
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
              TrackIt Terms
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight !text-white sm:text-5xl lg:text-6xl">
              Clear expectations for using TrackIt.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 !text-[var(--trackit-text-on-dark)] sm:text-lg">
              These terms describe the basic expectations for using TrackIt,
              participating in lost-and-found activity, and interacting with
              other members of the community.
            </p>
          </div>
        </div>
      </section>

      <main>
        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-5xl">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Terms overview
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Use TrackIt honestly, safely, and responsibly.
              </h2>

              <p className="mt-5 text-base leading-8 text-[var(--trackit-text-muted)]">
                TrackIt is intended to help people report lost and found
                property and work toward legitimate returns. Using the
                platform means accepting the responsibility to provide
                truthful information, respect other users, and follow the
                rules that protect the community.
              </p>
            </div>

            <div className="mt-12 space-y-6">
              {termsSections.map((section) => (
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
                Your responsibility
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                A trustworthy platform depends on responsible participation.
              </h2>

              <p className="mt-5 text-base leading-8 text-[var(--trackit-text-muted)]">
                TrackIt provides the tools and workflows, but every successful
                lost-and-found interaction also depends on the choices people
                make when using them.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {responsibilities.map((responsibility) => (
                <article
                  key={responsibility.title}
                  className="rounded-2xl border border-[var(--trackit-border)] bg-white p-6"
                >
                  <h3 className="text-lg font-extrabold text-[var(--trackit-navy)]">
                    {responsibility.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
                    {responsibility.description}
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
                Safety first
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Terms are only part of using TrackIt responsibly.
              </h2>

              <p className="mt-5 text-base leading-8 text-[var(--trackit-text-muted)]">
                Always consider your personal safety when communicating with
                someone about a lost or found item. Use the platform's safety
                guidance when arranging verification or a return.
              </p>
            </div>

            <div className="rounded-3xl bg-[var(--trackit-navy)] p-6 shadow-xl sm:p-8">
              <p className="text-base leading-8 !text-[var(--trackit-text-on-dark)]">
                TrackIt can help structure the process, but users should make
                sensible decisions about personal information, communication,
                verification, and meeting arrangements.
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
              Questions about the terms?
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight !text-white sm:text-4xl">
              Contact TrackIt if something is unclear.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 !text-[var(--trackit-text-on-dark)]">
              If you have a question about using TrackIt, your account, or a
              platform rule, contact TrackIt support for clarification.
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
