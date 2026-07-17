import {
  ContentFormat,
  FORMAT_LABELS,
  SUPPORTED_FORMATS,
} from "@/lib/types";

interface FormatSelectorProps {
  selected: ContentFormat[];
  onChange: (formats: ContentFormat[]) => void;
}

const FORMAT_DESCRIPTIONS: Record<ContentFormat, string> = {
  carousel: "Slide-by-slide outline for Instagram carousels",
  hooks: "Short opening lines for Reels and short-form video",
  caption: "Post captions with optional hashtags",
  linkedin: "One polished LinkedIn post",
  thread: "Multi-tweet X thread",
};

export function FormatSelector({ selected, onChange }: FormatSelectorProps) {
  function toggleFormat(format: ContentFormat) {
    if (selected.includes(format)) {
      onChange(selected.filter((item) => item !== format));
      return;
    }

    onChange([...selected, format]);
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-zinc-900">Output formats</h3>
        <p className="text-xs text-zinc-500">
          Choose one or more formats to generate from the same source.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SUPPORTED_FORMATS.map((format) => {
          const active = selected.includes(format);

          return (
            <button
              key={format}
              type="button"
              onClick={() => toggleFormat(format)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                active
                  ? "border-violet-500 bg-violet-50 shadow-sm"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-zinc-900">
                  {FORMAT_LABELS[format]}
                </span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    active ? "bg-violet-500" : "bg-zinc-200"
                  }`}
                />
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {FORMAT_DESCRIPTIONS[format]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
