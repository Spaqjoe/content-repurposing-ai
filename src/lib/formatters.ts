import {
  CaptionResult,
  CarouselResult,
  ContentFormat,
  FormatResults,
  HooksResult,
  LinkedInResult,
  ThreadResult,
} from "./types";

function extractJsonBlock(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    return objectMatch[0];
  }

  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch?.[0]) {
    return arrayMatch[0];
  }

  return text.trim();
}

function parseJson<T>(text: string): T {
  const cleaned = extractJsonBlock(text);
  return JSON.parse(cleaned) as T;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item).trim())
    .filter(Boolean);
}

export function parseFormatResult(
  format: ContentFormat,
  rawText: string,
): FormatResults[ContentFormat] {
  try {
    const parsed = parseJson<Record<string, unknown>>(rawText);

    switch (format) {
      case "carousel": {
        const slides = asStringArray(parsed.slides);
        if (slides.length === 0) {
          throw new Error("Missing carousel slides.");
        }
        return { slides } satisfies CarouselResult;
      }

      case "hooks": {
        const items = asStringArray(parsed.items);
        if (items.length === 0) {
          throw new Error("Missing hook items.");
        }
        return { items } satisfies HooksResult;
      }

      case "caption": {
        const variantsRaw = Array.isArray(parsed.variants)
          ? parsed.variants
          : [];

        const variants = variantsRaw
          .map((variant) => {
            if (typeof variant === "string") {
              return { text: variant.trim() };
            }

            if (variant && typeof variant === "object") {
              const record = variant as Record<string, unknown>;
              const text = String(record.text ?? "").trim();
              const hashtags = asStringArray(record.hashtags);
              return text
                ? {
                    text,
                    ...(hashtags.length ? { hashtags } : {}),
                  }
                : null;
            }

            return null;
          })
          .filter(Boolean) as CaptionResult["variants"];

        if (variants.length === 0) {
          throw new Error("Missing caption variants.");
        }

        return { variants } satisfies CaptionResult;
      }

      case "linkedin": {
        const post = String(parsed.post ?? "").trim();
        if (!post) {
          throw new Error("Missing LinkedIn post.");
        }
        return { post } satisfies LinkedInResult;
      }

      case "thread": {
        const tweets = asStringArray(parsed.tweets);
        if (tweets.length === 0) {
          throw new Error("Missing thread tweets.");
        }
        return { tweets } satisfies ThreadResult;
      }
    }
  } catch {
    return getFallbackResult(format, rawText);
  }
}

function getFallbackResult(
  format: ContentFormat,
  rawText: string,
): FormatResults[ContentFormat] {
  const cleaned = rawText.trim() || "Unable to parse model output.";

  switch (format) {
    case "carousel":
      return {
        slides: cleaned
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 8),
      };
    case "hooks":
      return {
        items: cleaned
          .split(/\n+/)
          .map((line) => line.replace(/^[-*\d.]+\s*/, "").trim())
          .filter(Boolean)
          .slice(0, 10),
      };
    case "caption":
      return {
        variants: [{ text: cleaned }],
      };
    case "linkedin":
      return { post: cleaned };
    case "thread":
      return {
        tweets: cleaned
          .split(/\n+/)
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 8),
      };
  }
}

export function summarizeResults(results: FormatResults): string {
  const parts: string[] = [];

  if (results.carousel?.slides.length) {
    parts.push(`${results.carousel.slides.length} carousel slides`);
  }
  if (results.hooks?.items.length) {
    parts.push(`${results.hooks.items.length} hooks`);
  }
  if (results.caption?.variants.length) {
    parts.push(`${results.caption.variants.length} captions`);
  }
  if (results.linkedin?.post) {
    parts.push("LinkedIn post");
  }
  if (results.thread?.tweets.length) {
    parts.push(`${results.thread.tweets.length}-tweet thread`);
  }

  return parts.join(", ") || "Generated content";
}

export function formatResultForCopy(
  format: ContentFormat,
  result: NonNullable<FormatResults[ContentFormat]>,
): string {
  switch (format) {
    case "carousel": {
      const carousel = result as CarouselResult;
      return carousel.slides
        .map((slide, index) => `Slide ${index + 1}: ${slide}`)
        .join("\n\n");
    }
    case "hooks": {
      const hooks = result as HooksResult;
      return hooks.items.map((item, index) => `${index + 1}. ${item}`).join("\n");
    }
    case "caption": {
      const caption = result as CaptionResult;
      return caption.variants
        .map((variant, index) => {
          const tags = variant.hashtags?.length
            ? `\n\n${variant.hashtags.join(" ")}`
            : "";
          return `Variant ${index + 1}:\n${variant.text}${tags}`;
        })
        .join("\n\n---\n\n");
    }
    case "linkedin": {
      const linkedin = result as LinkedInResult;
      return linkedin.post;
    }
    case "thread": {
      const thread = result as ThreadResult;
      return thread.tweets
        .map((tweet, index) => `${index + 1}/${thread.tweets.length} ${tweet}`)
        .join("\n\n");
    }
  }
}
