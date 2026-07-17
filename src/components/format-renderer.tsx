import {
  CaptionResult,
  CarouselResult,
  ContentFormat,
  FormatResults,
  HooksResult,
  LinkedInResult,
  ThreadResult,
} from "@/lib/types";

export function renderResult(
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
              className="flex gap-3 rounded-none border-l-4 border-accent-soft/60 bg-surface px-4 py-3"
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
              className="rounded-none border border-border bg-surface-high px-4 py-3 italic text-foreground"
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
              className="rounded-none bg-surface px-4 py-3"
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
        <div className="divide-y divide-border overflow-hidden rounded-none border border-border bg-surface-high">
          {thread.tweets.map((tweet, index) => (
            <div
              key={`${index}-${tweet.slice(0, 12)}`}
              className="flex gap-3 p-4"
            >
              <span className="shrink-0 font-mono text-xs text-primary">
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
