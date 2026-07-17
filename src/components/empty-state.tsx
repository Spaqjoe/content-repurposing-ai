import { Sparkle } from "@phosphor-icons/react/dist/ssr";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Your repurposed content will appear here",
  description = "Paste source content, choose your formats and tone, then generate platform-ready outputs.",
}: EmptyStateProps) {
  return (
    <div className="glass-panel flex min-h-[320px] flex-col items-center justify-center rounded-none border-dashed px-6 py-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-surface-high text-accent-soft">
        <Sparkle size={24} weight="fill" />
      </div>
      <h3 className="font-display text-base font-semibold text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
