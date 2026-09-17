import { Link } from "react-router-dom";

const exploreLinks = [
  { label: "Discover", to: "/discover" },
  { label: "How it works", to: "/how-it-works" },
  { label: "Safety", to: "/safety" },
  { label: "About TrackIt", to: "/about" },
];

const communityLinks = [
  { label: "Report a lost item", to: "/items/report-lost" },
  { label: "Report a found item", to: "/items/report-found" },
  { label: "Help", to: "/help" },
  { label: "Contact", to: "/contact" },
];

const trustLinks = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Safety guidelines", to: "/safety" },
];

export function PublicFooter() {
  return (
    <footer className="bg-[var(--trackit-midnight)] text-[var(--trackit-text-on-dark)]">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-8">
          <div className="max-w-md sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex rounded-lg text-2xl font-extrabold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              Track
              <span className="text-[var(--trackit-blue-bright)]">It</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--trackit-text-on-dark)]">
              A trusted lost-and-found platform designed to help people report,
              discover, verify, and return belongings safely.
            </p>

            <div className="mt-6">
              <Link
                to="/contact"
                className="inline-flex min-h-10 items-center rounded-lg border border-white/15 bg-white/5 px-4 text-sm font-semibold text-white transition-colors hover:border-[var(--trackit-blue-bright)] hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                Contact TrackIt
              </Link>
            </div>
          </div>

          <FooterGroup title="Explore" links={exploreLinks} />
          <FooterGroup title="Community" links={communityLinks} />
          <FooterGroup title="Trust & legal" links={trustLinks} />
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start lg:gap-12">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
                Contact TrackIt
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--trackit-text-on-dark)]">
                Need help with a report, claim, account, or safety concern?
                Reach us through the support channels below.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="mailto:isaackgofficial@gmail.com"
                aria-label="Email TrackIt support"
                title="Email TrackIt support"
                className="group flex min-h-20 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 text-white transition-colors hover:border-[var(--trackit-blue-bright)] hover:bg-white/10 hover:text-[var(--trackit-blue-bright)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                <EmailIcon />
                <span className="sr-only">Email TrackIt support</span>
              </a>

              <a
                href="https://wa.me/254743570561"
                target="_blank"
                rel="noreferrer"
                aria-label="Contact TrackIt on WhatsApp"
                title="Contact TrackIt on WhatsApp"
                className="group flex min-h-20 items-center justify-center rounded-xl border border-white/10 bg-white/5 p-4 text-white transition-colors hover:border-[var(--trackit-blue-bright)] hover:bg-white/10 hover:text-[var(--trackit-blue-bright)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
              >
                <WhatsAppIcon />
                <span className="sr-only">
                  Contact TrackIt on WhatsApp
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-[var(--trackit-text-on-dark)]">
            © {new Date().getFullYear()} TrackIt. Built to help lost things
            find their way home.
          </p>
        </div>
      </div>
    </footer>
  );
}

type FooterGroupProps = {
  title: string;
  links: Array<{
    label: string;
    to: string;
  }>;
};

function FooterGroup({ title, links }: FooterGroupProps) {
  return (
    <div>
      <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">
        {title}
      </h2>

      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={`${link.label}-${link.to}`}>
            <Link
              to={link.to}
              className="inline-flex min-h-8 items-center rounded-md text-sm leading-6 text-[var(--trackit-text-on-dark)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-8 w-8 transition-transform duration-200 group-hover:scale-110"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="m4.5 7 7 5.25a.85.85 0 0 0 1 0L19.5 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-9 w-9 transition-transform duration-200 group-hover:scale-110"
    >
      <path
        d="M20.5 11.65a8.45 8.45 0 0 1-12.45 7.43L3.5 20.5l1.48-4.38A8.45 8.45 0 1 1 20.5 11.65Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M8.3 8.3c.2-.45.4-.46.72-.46h.5c.2 0 .4.08.5.3l.72 1.65c.1.23.08.42-.08.6l-.5.58c-.13.15-.15.3-.05.48.3.55.76 1.02 1.3 1.35.2.12.34.1.48-.04l.6-.57c.15-.15.34-.18.55-.08l1.6.76c.22.1.3.25.28.48-.05.58-.32 1.1-.77 1.4-.43.3-1.03.3-1.7.08-1.15-.37-2.17-1.03-3.04-1.9-.88-.88-1.55-1.9-1.92-3.05-.22-.67-.22-1.27.08-1.68.18-.25.43-.4.73-.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

