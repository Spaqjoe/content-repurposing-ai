interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "Generating platform-ready content...",
}: LoadingStateProps) {
  return (
    <div className="glass-panel flex min-h-[320px] flex-col justify-center gap-4 rounded-xl px-6 py-10">
      <div className="space-y-3">
        <div className="skeleton-shimmer h-4 w-1/3 rounded-lg" />
        <div className="skeleton-shimmer h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          <div className="skeleton-shimmer h-20 rounded-xl" />
          <div className="skeleton-shimmer h-20 rounded-xl" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="mt-2 text-xs leading-5 text-muted">
          Crafting carousel slides, hooks, and captions from your source content.
        </p>
      </div>
    </div>
  );
}
