interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = "Generating platform-ready content...",
}: LoadingStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-violet-200 bg-violet-50/40 px-6 py-10 text-center">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      <p className="text-sm font-medium text-zinc-900">{message}</p>
      <p className="mt-2 max-w-sm text-xs leading-5 text-zinc-500">
        Crafting carousel slides, hooks, and captions from your source content.
      </p>
    </div>
  );
}
