import { Link } from "react-router-dom";

export function LostFoundSection() {
  return (
    <section className="bg-[var(--trackit-surface)] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--trackit-blue)]">
            Lost or found
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--trackit-navy)] sm:text-4xl lg:text-5xl">
            Start from the situation you are in.
          </h2>

          <p className="mt-5 text-base leading-8 text-[var(--trackit-text-muted)] sm:text-lg">
            Whether something disappeared from your hands or you discovered
            someone else&apos;s belonging, TrackIt gives you a structured way
            to report what happened and help move it toward a safe return.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <LostFoundCard
            eyebrow="Lost item"
            title="Something is missing."
            description="Create a detailed lost-item report with the information that can help others recognize it without exposing unnecessary private details."
            points={[
              "Describe the item and where it was last seen.",
              "Add useful identifying details and media.",
              "Monitor possible matches and claims.",
            ]}
            actionLabel="Report a lost item"
            actionTo="/items/report-lost"
            variant="dark"
          />

          <LostFoundCard
            eyebrow="Found item"
            title="You found something."
            description="Report a found belonging so its owner has a structured place to discover it and begin a safe verification process."
            points={[
              "Describe where and when it was found.",
              "Add identifying details and supporting media.",
              "Review ownership claims through TrackIt.",
            ]}
            actionLabel="Report a found item"
            actionTo="/items/report-found"
            variant="light"
          />
        </div>
      </div>
    </section>
  );
}

type LostFoundCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  actionLabel: string;
  actionTo: string;
  variant: "dark" | "light";
};

function LostFoundCard({
  eyebrow,
  title,
  description,
  points,
  actionLabel,
  actionTo,
  variant,
}: LostFoundCardProps) {
  const isDark = variant === "dark";

  return (
    <article
      className={[
        "relative overflow-hidden rounded-3xl border p-7 shadow-sm sm:p-8 lg:p-10",
        isDark
          ? "border-[var(--trackit-dark-card-border)] bg-[var(--trackit-dark-card)] text-[var(--trackit-dark-card-text)]"
          : "border-[var(--trackit-landing-card-border)] bg-[var(--trackit-landing-card-bg)] text-[var(--trackit-landing-card-text)]",
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "absolute right-[-5rem] top-[-5rem] h-48 w-48 rounded-full blur-3xl",
          isDark
            ? "bg-[var(--trackit-blue)]/20"
            : "bg-[var(--trackit-blue)]/10",
        ].join(" ")}
      />

      <div className="relative">
        <p
          className={[
            "text-xs font-bold uppercase tracking-[0.16em]",
            "text-[var(--trackit-blue-bright)]",
          ].join(" ")}
        >
          {eyebrow}
        </p>

        <h3
          className={[
            "mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl",
            isDark
              ? "text-[var(--trackit-dark-card-text)]"
              : "text-[var(--trackit-landing-card-text)]",
          ].join(" ")}
        >
          {title}
        </h3>

        <p
          className={[
            "mt-4 text-sm leading-7 sm:text-base",
            isDark
              ? "text-[var(--trackit-dark-card-muted)]"
              : "text-[var(--trackit-landing-card-muted)]",
          ].join(" ")}
        >
          {description}
        </p>

        <ul className="mt-7 space-y-4">
          {points.map((point) => (
            <li
              key={point}
              className="flex gap-3 text-sm leading-6 sm:text-base"
            >
              <span
                aria-hidden="true"
                className={[
                  "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
                  isDark
                    ? "bg-[var(--trackit-blue)] text-white"
                    : "bg-[var(--trackit-blue-soft)] text-[var(--trackit-blue)]",
                ].join(" ")}
              >
                ✓
              </span>

              <span
                className={
                  isDark
                    ? "text-[var(--trackit-dark-card-muted)]"
                    : "text-[var(--trackit-landing-card-muted)]"
                }
              >
                {point}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Link
            to={actionTo}
            className={[
              "inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-sm font-bold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)] focus-visible:ring-offset-2",
              isDark
                ? "bg-[var(--trackit-blue)] text-white hover:bg-[var(--trackit-blue-hover)] focus-visible:ring-offset-[var(--trackit-dark-card)]"
                : "border border-[var(--trackit-blue)] bg-[var(--trackit-landing-card-bg)] text-[var(--trackit-blue)] hover:bg-[var(--trackit-surface-blue)] focus-visible:ring-offset-[var(--trackit-landing-card-bg)]",
            ].join(" ")}
          >
            {actionLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}

