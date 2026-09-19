import { Link } from "react-router-dom";

const principles = [
  {
    number: "01",
    title: "Structured",
    description:
      "TrackIt turns scattered lost-and-found information into organized reports with the details needed to understand an item and its situation.",
  },
  {
    number: "02",
    title: "Community-focused",
    description:
      "The platform is built around people helping belongings find their way back to their rightful owners through a clearer shared process.",
  },
  {
    number: "03",
    title: "Verification-aware",
    description:
      "A possible match is not treated as automatic proof of ownership. Claims and review are part of the journey toward a responsible return.",
  },
  {
    number: "04",
    title: "Safety-conscious",
    description:
      "TrackIt encourages users to share useful information without unnecessarily exposing personal or sensitive details.",
  },
];

const problems = [
  {
    title: "Scattered reports",
    description:
      "Lost-and-found information can become difficult to follow when reports are spread across social media posts, messages, groups, and conversations.",
  },
  {
    title: "Incomplete information",
    description:
      "A short post may not contain enough structured information to help another person recognize whether an item is actually theirs.",
  },
  {
    title: "Unclear ownership",
    description:
      "Finding something that looks familiar does not automatically establish who owns it. A responsible process needs room for verification.",
  },
];

export function AboutPage() {
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
              About TrackIt
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight !text-white sm:text-5xl lg:text-6xl">
              A clearer way to help lost belongings find their way home.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 !text-[var(--trackit-text-on-dark)] sm:text-lg">
              TrackIt is a lost-and-found platform designed to organize the
              journey from reporting an item to discovering possibilities,
              verifying ownership, and working toward a responsible return.
            </p>
          </div>
        </div>
      </section>

      <main>
        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                Why TrackIt exists
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Lost-and-found should not depend on scattered posts.
              </h2>

              <div className="mt-6 space-y-5 text-base leading-8 text-[var(--trackit-text-muted)]">
                <p>
                  When something goes missing, people often turn to social
                  media, group chats, community boards, or word of mouth. These
                  channels can help, but important information can become
                  difficult to organize and follow.
                </p>

                <p>
                  TrackIt is designed to provide a dedicated place where lost
                  and found reports can be recorded in a more consistent way.
                  Instead of treating every situation as an isolated post,
                  TrackIt creates a structured journey around the item.
                </p>

                <p>
                  The goal is not simply to help someone find a similar-looking
                  object. The platform is designed to support the steps between
                  discovering a possible match and responsibly returning an
                  item.
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] bg-[var(--trackit-dark-card)] p-6 shadow-xl sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
                The TrackIt approach
              </p>

              <div className="mt-6 space-y-4">
                <ApproachRow
                  number="01"
                  title="Report"
                  description="Create a useful record of what was lost or found."
                />

                <ApproachRow
                  number="02"
                  title="Discover"
                  description="Identify reports that may be relevant."
                />

                <ApproachRow
                  number="03"
                  title="Verify"
                  description="Use claims and review to establish ownership."
                />

                <ApproachRow
                  number="04"
                  title="Return"
                  description="Work toward a responsible handover."
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--trackit-surface-blue)] px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                The problem
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                The information matters as much as the item.
              </h2>

              <p className="mt-4 text-base leading-8 text-[var(--trackit-text-muted)]">
                A lost-and-found platform needs to do more than display
                descriptions. It needs to help people organize information,
                identify possibilities, and make better decisions about what
                happens next.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {problems.map((problem) => (
                <article
                  key={problem.title}
                  className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8"
                >
                  <div className="h-1.5 w-12 rounded-full bg-[var(--trackit-blue)]" />

                  <h3 className="mt-6 text-xl font-extrabold text-[var(--trackit-navy)]">
                    {problem.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[var(--trackit-text-muted)]">
                    {problem.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
                What we value
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl">
                Built around useful information and responsible interactions.
              </h2>

              <p className="mt-4 text-base leading-8 text-[var(--trackit-text-muted)]">
                TrackIt&apos;s foundation is not just the technology behind the
                platform. It is the way the platform is intended to be used.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {principles.map((principle) => (
                <article
                  key={principle.number}
                  className="rounded-3xl border border-[var(--trackit-border)] bg-[var(--trackit-surface)] p-6 shadow-sm sm:p-8"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--trackit-dark-card)] text-sm font-extrabold text-[var(--trackit-dark-card-text)]">
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

        <section className="bg-[var(--trackit-midnight)] px-5 py-16 text-white sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
                A platform, not just a listing
              </p>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight !text-white sm:text-4xl">
                Every report is part of a larger journey.
              </h2>
            </div>

            <div>
              <p className="text-base leading-8 !text-[var(--trackit-text-on-dark)]">
                TrackIt connects reporting, discovery, claims, verification,
                communication, and returns into one platform. As the system
                grows, these connected workflows can provide a clearer
                experience for people who have lost something and people who
                have found something.
              </p>

              <p className="mt-5 text-base leading-8 !text-[var(--trackit-text-on-dark)]">
                The platform is being built with a focus on reliability,
                responsible information handling, and a practical experience
                that works across phones, tablets, and desktops.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto w-full max-w-4xl rounded-[2rem] bg-[var(--trackit-dark-card)] px-6 py-12 text-center sm:px-10 sm:py-16">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
              Start with TrackIt
            </p>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight !text-[var(--trackit-dark-card-text)] sm:text-4xl">
              Give your lost or found item a structured place to start.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 !text-[var(--trackit-dark-card-muted)]">
              Create an account and use TrackIt to report, discover, verify,
              and manage your lost-and-found activity.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-6 text-sm font-bold !text-white transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-dark-card)]"
              >
                Start with TrackIt
              </Link>

              <Link
                to="/how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 text-sm font-bold !text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-dark-card)]"
              >
                See how it works
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

type ApproachRowProps = {
  number: string;
  title: string;
  description: string;
};

function ApproachRow({
  number,
  title,
  description,
}: ApproachRowProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--trackit-blue)] text-xs font-extrabold text-white">
        {number}
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold !text-white">{title}</h3>

        <p className="mt-1 text-sm leading-6 !text-[var(--trackit-text-on-dark)]">
          {description}
        </p>
      </div>
    </div>
  );
}