import {
  CTA_LABELS,
  CtaStyle,
  SUPPORTED_CTA_STYLES,
  SUPPORTED_TONES,
  TONE_LABELS,
  Tone,
} from "@/lib/types";

interface ToneSelectorProps {
  tone: Tone;
  ctaStyle: CtaStyle;
  onToneChange: (tone: Tone) => void;
  onCtaStyleChange: (ctaStyle: CtaStyle) => void;
}

export function ToneSelector({
  tone,
  ctaStyle,
  onToneChange,
  onCtaStyleChange,
}: ToneSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="tone" className="text-sm font-medium text-zinc-900">
          Tone
        </label>
        <select
          id="tone"
          value={tone}
          onChange={(event) => onToneChange(event.target.value as Tone)}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        >
          {SUPPORTED_TONES.map((option) => (
            <option key={option} value={option}>
              {TONE_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="cta-style" className="text-sm font-medium text-zinc-900">
          CTA style
        </label>
        <select
          id="cta-style"
          value={ctaStyle}
          onChange={(event) =>
            onCtaStyleChange(event.target.value as CtaStyle)
          }
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        >
          {SUPPORTED_CTA_STYLES.map((option) => (
            <option key={option} value={option}>
              {CTA_LABELS[option]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
