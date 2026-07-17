import { CopyButton } from "./copy-button";

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  copyValue?: string;
  badge?: string;
  badgeTone?: "primary" | "secondary" | "tertiary";
}

const BADGE_STYLES = {
  primary: "bg-accent-container/30 text-accent-soft",
  secondary: "bg-[color-mix(in_oklch,var(--secondary)_20%,transparent)] text-secondary-soft",
  tertiary: "bg-[oklch(0.45_0.12_340_/0.3)] text-[oklch(0.85_0.08_340)]",
} as const;

export function ResultCard({
  title,
  children,
  copyValue,
  badge,
  badgeTone = "primary",
}: ResultCardProps) {
  return (
    <article className="glass-panel group rounded-xl p-5 transition hover:shadow-[0_0_20px_rgba(210,187,255,0.12)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {badge ? (
            <span
              className={`mb-1.5 inline-block rounded px-2 py-0.5 font-mono text-[11px] font-medium ${BADGE_STYLES[badgeTone]}`}
            >
              {badge}
            </span>
          ) : null}
          <h3 className="font-display text-base font-semibold text-foreground">
            {title}
          </h3>
        </div>
        {copyValue ? <CopyButton value={copyValue} /> : null}
      </div>
      <div className="space-y-3 text-sm leading-6 text-muted">{children}</div>
    </article>
  );
}
