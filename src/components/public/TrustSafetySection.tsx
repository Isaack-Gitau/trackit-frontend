import { Link } from "react-router-dom";

const safetyPoints = [
  {
    title: "Share only what helps",
    description:
      "Item posts should contain useful identifying information without unnecessarily exposing private or sensitive details.",
  },
  {
    title: "Verify before returning",
    description:
      "Ownership claims give the relevant people a structured way to provide information that can help verify a belonging.",
  },
  {
    title: "Keep communication responsible",
    description:
      "Treat other users respectfully and avoid sharing passwords, financial information, or other sensitive credentials.",
  },
];

export function TrustSafetySection() {
  return (
    <section className="bg-[var(--trackit-midnight)] py-16 text-white sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
          <div className="max-w-xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
              Trust & safety
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Designed for responsible lost-and-found interactions.
            </h2>

            <p className="mt-5 text-base leading-8 text-[var(--trackit-text-on-dark)] sm:text-lg">
              Finding a belonging is only part of the process. TrackIt is
              structured around careful posting, ownership verification, and
              responsible communication.
            </p>

            <Link
              to="/safety"
              className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-midnight)]"
            >
              Read safety guidelines
            </Link>
          </div>

          <div className="grid gap-4">
            {safetyPoints.map((point, index) => (
              <article
                key={point.title}
                className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6"
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--trackit-blue)] text-sm font-extrabold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {point.title}
                    </h3>

                    <p className="mt-2 text-sm leading-7 text-[var(--trackit-text-on-dark)] sm:text-base">
                      {point.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}

            <div className="rounded-2xl border border-[var(--trackit-blue)]/30 bg-[var(--trackit-blue)]/10 p-5 sm:p-6">
              <p className="text-sm font-bold text-[var(--trackit-blue-bright)]">
                Remember
              </p>

              <p className="mt-2 text-sm leading-7 text-[var(--trackit-text-on-dark)] sm:text-base">
                TrackIt helps organize the process, but users should still
                use good judgment when arranging handovers and sharing
                information with other people.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
