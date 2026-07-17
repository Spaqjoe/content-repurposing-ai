import { CopyButton } from "./copy-button";

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  copyValue?: string;
}

export function ResultCard({ title, children, copyValue }: ResultCardProps) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {copyValue ? <CopyButton value={copyValue} /> : null}
      </div>
      <div className="space-y-3 text-sm leading-6 text-zinc-700">{children}</div>
    </article>
  );
}
