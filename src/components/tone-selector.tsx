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
        <label htmlFor="tone" className="text-sm font-medium text-foreground">
          Tone
        </label>
        <select
          id="tone"
          value={tone}
          onChange={(event) => onToneChange(event.target.value as Tone)}
          className="input-field w-full rounded-xl px-4 py-3 text-sm"
        >
          {SUPPORTED_TONES.map((option) => (
            <option key={option} value={option}>
              {TONE_LABELS[option]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="cta-style"
          className="text-sm font-medium text-foreground"
        >
          CTA style
        </label>
        <select
          id="cta-style"
          value={ctaStyle}
          onChange={(event) =>
            onCtaStyleChange(event.target.value as CtaStyle)
          }
          className="input-field w-full rounded-xl px-4 py-3 text-sm"
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
