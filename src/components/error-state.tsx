interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4">
      <h3 className="text-sm font-semibold text-red-800">Generation failed</h3>
      <p className="mt-1 text-sm leading-6 text-red-700">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-red-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-800"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
