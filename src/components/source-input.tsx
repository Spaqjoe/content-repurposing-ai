import { MAX_SOURCE_LENGTH } from "@/lib/types";

interface SourceInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SourceInput({ value, onChange }: SourceInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="source-content" className="text-sm font-medium text-zinc-900">
          Source content
        </label>
        <span className="text-xs text-zinc-500">
          {value.length}/{MAX_SOURCE_LENGTH}
        </span>
      </div>
      <textarea
        id="source-content"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste a blog excerpt, newsletter draft, transcript snippet, or notes..."
        maxLength={MAX_SOURCE_LENGTH}
        rows={12}
        className="w-full resize-y rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />
      <p className="text-xs text-zinc-500">
        URL imports, audio, and video uploads are planned for later. For the MVP,
        paste your source text here.
      </p>
    </div>
  );
}
