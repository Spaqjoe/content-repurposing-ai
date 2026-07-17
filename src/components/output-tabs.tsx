"use client";

import { useMemo, useState } from "react";
import {
  CaptionResult,
  CarouselResult,
  ContentFormat,
  FORMAT_LABELS,
  FormatResults,
  HooksResult,
  LinkedInResult,
  ThreadResult,
} from "@/lib/types";
import { formatResultForCopy } from "@/lib/formatters";
import { ResultCard } from "./result-card";

interface OutputTabsProps {
  formats: ContentFormat[];
  results: FormatResults;
}

const BADGE_MAP: Record<
  ContentFormat,
  { label: string; tone: "primary" | "secondary" | "tertiary" }
> = {
  carousel: { label: "Carousel Outline", tone: "tertiary" },
  hooks: { label: "Reel Hooks", tone: "secondary" },
  caption: { label: "Post Captions", tone: "primary" },
  linkedin: { label: "LinkedIn", tone: "secondary" },
  thread: { label: "X Thread", tone: "tertiary" },
};

export function OutputTabs({ formats, results }: OutputTabsProps) {
  const availableFormats = formats.filter((format) => results[format]);
  const [activeFormat, setActiveFormat] = useState<ContentFormat>(
    availableFormats[0] ?? formats[0],
  );

  const activeResult = results[activeFormat];
  const copyValue = useMemo(() => {
    if (!activeResult) {
      return "";
    }

    return formatResultForCopy(activeFormat, activeResult);
  }, [activeFormat, activeResult]);

  if (!availableFormats.length) {
    return null;
  }

  const badge = BADGE_MAP[activeFormat];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableFormats.map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => setActiveFormat(format)}
            className={`btn-press rounded-full px-4 py-2 font-mono text-sm font-medium transition ${
              activeFormat === format
                ? "bg-accent-container text-white"
                : "bg-surface-high text-muted hover:bg-surface-highest hover:text-foreground"
            }`}
          >
            {FORMAT_LABELS[format]}
          </button>
        ))}
      </div>

      {activeResult ? (
        <ResultCard
          title={FORMAT_LABELS[activeFormat]}
          copyValue={copyValue}
          badge={badge.label}
          badgeTone={badge.tone}
        >
          {renderResult(activeFormat, activeResult)}
        </ResultCard>
      ) : null}
    </div>
  );
}

function renderResult(
  format: ContentFormat,
  result: NonNullable<FormatResults[ContentFormat]>,
) {
  switch (format) {
    case "carousel": {
      const carousel = result as CarouselResult;
      return (
        <ol className="space-y-3">
          {carousel.slides.map((slide, index) => (
            <li
              key={`${index}-${slide.slice(0, 12)}`}
              className="flex gap-3 rounded-xl border-l-4 border-accent-soft/60 bg-surface px-4 py-3"
            >
              <span className="font-mono text-xs font-bold text-accent-soft">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-foreground">{slide}</span>
            </li>
          ))}
        </ol>
      );
    }

    case "hooks": {
      const hooks = result as HooksResult;
      return (
        <ul className="space-y-3">
          {hooks.items.map((item, index) => (
            <li
              key={`${index}-${item.slice(0, 12)}`}
              className="rounded-xl border border-white/5 bg-surface-high px-4 py-3 italic text-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      );
    }

    case "caption": {
      const caption = result as CaptionResult;
      return (
        <div className="space-y-4">
          {caption.variants.map((variant, index) => (
            <div
              key={`${index}-${variant.text.slice(0, 12)}`}
              className="rounded-xl bg-surface px-4 py-3"
            >
              <span className="mb-2 block font-mono text-[11px] font-semibold uppercase tracking-wider text-outline">
                Option {String.fromCharCode(65 + index)}
              </span>
              <p className="whitespace-pre-wrap text-foreground">
                {variant.text}
              </p>
              {variant.hashtags?.length ? (
                <p className="mt-3 text-xs text-accent-soft">
                  {variant.hashtags.join(" ")}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      );
    }

    case "linkedin": {
      const linkedin = result as LinkedInResult;
      return (
        <p className="whitespace-pre-wrap text-foreground">{linkedin.post}</p>
      );
    }

    case "thread": {
      const thread = result as ThreadResult;
      return (
        <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10 bg-surface-high">
          {thread.tweets.map((tweet, index) => (
            <div key={`${index}-${tweet.slice(0, 12)}`} className="flex gap-3 p-4">
              <span className="shrink-0 font-mono text-xs text-secondary">
                {index + 1}/{thread.tweets.length}
              </span>
              <p className="text-foreground">{tweet}</p>
            </div>
          ))}
        </div>
      );
    }
  }
}
