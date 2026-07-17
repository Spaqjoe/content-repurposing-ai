interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Your repurposed content will appear here",
  description = "Paste source content, choose your formats and tone, then generate platform-ready outputs.",
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-semibold text-violet-600 shadow-sm">
        AI
      </div>
      <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}
