import { useEffect, useRef } from "react";

import { Button } from "./Button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  loading?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  variant = "primary",
  loading = false,
  errorMessage = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !loading) {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div className="absolute inset-0 bg-slate-950/50" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trackit-confirm-dialog-title"
        aria-describedby="trackit-confirm-dialog-description"
        tabIndex={-1}
        className={[
          "relative z-10 w-full max-w-md rounded-2xl border",
          "border-[var(--trackit-border)]",
          "bg-[var(--trackit-surface-raised)] p-6 shadow-xl",
          "focus:outline-none",
        ].join(" ")}
      >
        <h2
          id="trackit-confirm-dialog-title"
          className="text-xl font-bold text-[var(--trackit-navy)]"
        >
          {title}
        </h2>

        <p
          id="trackit-confirm-dialog-description"
          className="mt-3 text-sm leading-6 text-[var(--trackit-muted)]"
        >
          {description}
        </p>

        {errorMessage ? (
          <div
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3"
            role="alert"
          >
            <p className="text-sm leading-6 text-red-800">
              {errorMessage}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={variant}
            size="sm"
            loading={loading}
            disabled={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
