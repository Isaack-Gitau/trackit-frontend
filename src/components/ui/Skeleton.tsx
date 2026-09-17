import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({
  className = "",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        "animate-pulse rounded-md",
        "bg-[var(--trackit-blue-soft)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
