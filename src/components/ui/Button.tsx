import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "danger"
  | "ghost";

type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
};

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkButtonProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type TrackItButtonProps = ButtonProps | LinkButtonProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--trackit-blue)] text-white shadow-sm hover:bg-[var(--trackit-blue-hover)]",

  secondary:
    "bg-[var(--trackit-button-secondary-bg)] text-white shadow-sm hover:bg-[var(--trackit-button-secondary-hover)]",

  outline:
    "border border-[var(--trackit-border)] bg-[var(--trackit-surface)] text-[var(--trackit-navy)] hover:border-[var(--trackit-blue)] hover:text-[var(--trackit-blue)]",

  danger:
    "bg-[var(--trackit-danger)] text-white shadow-sm hover:bg-[var(--trackit-danger-hover)]",

  ghost:
    "bg-transparent text-[var(--trackit-navy)] hover:bg-[var(--trackit-blue-soft)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

function combineClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className?: string,
): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-lg",
    "font-semibold leading-none",
    "transition-colors duration-200",
    "focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--trackit-blue-bright)]",
    "focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function LoadingIndicator() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

export function Button(props: ButtonProps): ReactNode;
export function Button(props: LinkButtonProps): ReactNode;
export function Button(props: TrackItButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    className,
  } = props;

  const classes = combineClasses(
    variant,
    size,
    fullWidth,
    className,
  );

  if ("href" in props && props.href) {
    const {
      href,
      children,
      variant: _variant,
      size: _size,
      loading: _loading,
      fullWidth: _fullWidth,
      className: _className,
      ...anchorProps
    } = props;

    return (
      <a
        {...anchorProps}
        href={href}
        className={classes}
        aria-disabled={loading || undefined}
      >
        {loading ? <LoadingIndicator /> : null}
        {children}
      </a>
    );
  }

  const {
    children,
    variant: _variant,
    size: _size,
    loading: _loading,
    fullWidth: _fullWidth,
    className: _className,
    disabled,
    type,
    ...buttonProps
  } = props as ButtonProps;

  return (
    <button
      {...buttonProps}
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <LoadingIndicator /> : null}
      {children}
    </button>
  );
}
