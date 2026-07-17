"use client";

import { useMemo, useState } from "react";
import {
  ContentFormat,
  FORMAT_LABELS,
  FormatResults,
} from "@/lib/types";
import { formatResultForCopy } from "@/lib/formatters";
import { renderResult } from "@/components/format-renderer";
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
            className={`btn-press rounded-none px-4 py-2 font-mono text-sm font-medium transition ${
              activeFormat === format
                ? "bg-primary text-primary-foreground"
                : "bg-surface-high text-muted-foreground hover:bg-surface-highest hover:text-foreground"
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
