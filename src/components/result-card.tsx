import { CopyButton } from "./copy-button";

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  copyValue?: string;
  badge?: string;
  badgeTone?: "primary" | "secondary" | "tertiary";
}

const BADGE_STYLES = {
  primary: "bg-primary/15 text-primary",
  secondary: "bg-accent text-accent-foreground",
  tertiary: "bg-primary/15 text-primary",
} as const;

export function ResultCard({
  title,
  children,
  copyValue,
  badge,
  badgeTone = "primary",
}: ResultCardProps) {
  return (
    <article className="glass-panel group rounded-none p-5 transition hover:shadow-[0_0_20px_color-mix(in oklch, var(--primary) 18%, transparent)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          {badge ? (
            <span
              className={`mb-1.5 inline-block rounded-none px-2 py-0.5 font-mono text-[11px] font-medium ${BADGE_STYLES[badgeTone]}`}
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
      <div className="space-y-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </article>
  );
}
