"use client";

import { WarningCircle } from "@phosphor-icons/react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-none border border-[color-mix(in_oklch,var(--destructive)_35%,transparent)] bg-destructive-container/40 px-5 py-4">
      <div className="flex items-start gap-3">
        <WarningCircle
          size={20}
          weight="fill"
          className="mt-0.5 shrink-0 text-destructive"
        />
        <div>
          <h3 className="text-sm font-semibold text-destructive">Generation failed</h3>
          <p className="mt-1 text-sm leading-6 text-[color-mix(in_oklch,var(--destructive)_85%,white)]">
            {message}
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="btn-press mt-4 rounded-none bg-destructive px-4 py-2 text-xs font-medium text-destructive-foreground transition hover:opacity-90"
            >
              Try again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
