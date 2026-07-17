"use client";

import { WarningCircle } from "@phosphor-icons/react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-[color-mix(in_oklch,var(--error)_35%,transparent)] bg-error-container/40 px-5 py-4">
      <div className="flex items-start gap-3">
        <WarningCircle
          size={20}
          weight="fill"
          className="mt-0.5 shrink-0 text-error"
        />
        <div>
          <h3 className="text-sm font-semibold text-error">Generation failed</h3>
          <p className="mt-1 text-sm leading-6 text-[color-mix(in_oklch,var(--error)_85%,white)]">
            {message}
          </p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="btn-press mt-4 rounded-full bg-error px-4 py-2 text-xs font-medium text-[oklch(0.2_0.05_25)] transition hover:opacity-90"
            >
              Try again
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
