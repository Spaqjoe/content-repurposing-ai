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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {availableFormats.map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => setActiveFormat(format)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeFormat === format
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {FORMAT_LABELS[format]}
          </button>
        ))}
      </div>

      {activeResult ? (
        <ResultCard title={FORMAT_LABELS[activeFormat]} copyValue={copyValue}>
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
              className="rounded-xl bg-zinc-50 px-4 py-3"
            >
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-violet-600">
                Slide {index + 1}
              </span>
              {slide}
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
              className="rounded-xl bg-zinc-50 px-4 py-3"
            >
              <span className="mr-2 font-semibold text-violet-600">
                {index + 1}.
              </span>
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
              className="rounded-xl bg-zinc-50 px-4 py-3"
            >
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-violet-600">
                Variant {index + 1}
              </span>
              <p className="whitespace-pre-wrap">{variant.text}</p>
              {variant.hashtags?.length ? (
                <p className="mt-3 text-xs text-violet-700">
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
      return <p className="whitespace-pre-wrap">{linkedin.post}</p>;
    }

    case "thread": {
      const thread = result as ThreadResult;
      return (
        <div className="space-y-3">
          {thread.tweets.map((tweet, index) => (
            <div
              key={`${index}-${tweet.slice(0, 12)}`}
              className="rounded-xl bg-zinc-50 px-4 py-3"
            >
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-violet-600">
                Tweet {index + 1}
              </span>
              {tweet}
            </div>
          ))}
        </div>
      );
    }
  }
}
