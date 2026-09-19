import { Link } from "react-router-dom";

import { AboutSection } from "../../components/public/AboutSection";
import { DiscoverySection } from "../../components/public/DiscoverySection";
import { FinalCtaSection } from "../../components/public/FinalCtaSection";
import { LostFoundSection } from "../../components/public/LostFoundSection";
import { ProcessSection } from "../../components/public/ProcessSection";
import { TrustSafetySection } from "../../components/public/TrustSafetySection";

export function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative isolate bg-[var(--trackit-midnight)] text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute -left-32 top-[-12rem] h-96 w-96 rounded-full bg-[var(--trackit-blue)]/20 blur-3xl" />

          <div className="absolute right-[-10rem] top-20 h-[32rem] w-[32rem] bg-[var(--trackit-blue-bright)]/10 blur-3xl" />

          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--trackit-deep-navy)] to-transparent" />
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:min-h-[calc(100vh-4.5rem)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--trackit-blue-bright)]">
              Lost & found, organized
            </p>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Lost something? Let TrackIt help bring it home.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-[var(--trackit-text-on-dark)] sm:text-lg">
              Post lost and found belongings, discover relevant posts,
              verify ownership, and move toward a safe return through one
              structured platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/items/post-lost"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-[var(--trackit-blue)] px-6 text-sm font-bold text-white shadow-lg shadow-black/20 transition-colors hover:bg-[var(--trackit-blue-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-midnight)]"
              >
                Post a lost item
              </Link>

              <Link
                to="/items/post-found"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/15 bg-white/5 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--trackit-midnight)]"
              >
                Post a found item
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--trackit-text-on-dark)]">
              <span>Structured posts</span>
              <span>Ownership verification</span>
              <span>Safer returns</span>
            </div>
          </div>

          <div className="relative">
            <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue-bright)]">
                    TrackIt case
                  </p>

                  <h2 className="mt-2 text-lg font-bold text-white">
                    A structured path back home
                  </h2>
                </div>

                <span className="rounded-full border border-[var(--trackit-blue)]/30 bg-[var(--trackit-blue)]/10 px-3 py-1 text-xs font-semibold text-[var(--trackit-blue-bright)]">
                  Protected
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <EvidenceCard
                  number="01"
                  title="Post"
                  description="Record the important details about what was lost or found."
                />

                <EvidenceCard
                  number="02"
                  title="Discover"
                  description="Use structured posts to identify relevant possibilities."
                />

                <EvidenceCard
                  number="03"
                  title="Verify"
                  description="Use the claim process to establish ownership before a return."
                />

                <EvidenceCard
                  number="04"
                  title="Return"
                  description="Move toward a safe handover with the right information."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How TrackIt works */}
      <ProcessSection />

      {/* Public discovery */}
      <DiscoverySection />

      {/* Lost vs found */}
      <LostFoundSection />

      {/* Trust and safety */}
      <TrustSafetySection />

      {/* About TrackIt */}
      <AboutSection />

      {/* Final call to action */}
      <FinalCtaSection />
    </div>
  );
}

type EvidenceCardProps = {
  number: string;
  title: string;
  description: string;
};

function EvidenceCard({
  number,
  title,
  description,
}: EvidenceCardProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-black/10 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--trackit-blue)] text-xs font-extrabold text-white">
        {number}
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-bold text-white">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-[var(--trackit-text-on-dark)]">
          {description}
        </p>
      </div>
    </div>
  );
}

