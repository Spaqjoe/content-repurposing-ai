import {
  AI_MODEL,
  ContentFormat,
  FormatResults,
  GenerationRequest,
} from "./types";
import { buildPromptMessages } from "./prompts";
import { parseFormatResult } from "./formatters";

type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

function extractResponseText(response: unknown): string {
  if (!response) {
    return "";
  }

  if (typeof response === "string") {
    return response;
  }

  if (typeof response === "object") {
    const record = response as Record<string, unknown>;
    if (typeof record.response === "string") {
      return record.response;
    }
    if (typeof record.text === "string") {
      return record.text;
    }
    if (typeof record.content === "string") {
      return record.content;
    }
  }

  return JSON.stringify(response);
}

function buildMockResult(format: ContentFormat, sourceContent: string) {
  const snippet = sourceContent.slice(0, 120);

  switch (format) {
    case "carousel":
      return {
        slides: [
          `Hook: ${snippet}`,
          "Break down the core insight in one clear sentence.",
          "Share a practical example your audience can relate to.",
          "Explain why this matters right now.",
          "Give one actionable takeaway.",
          "Invite your audience to save, share, or try it today.",
        ],
      };
    case "hooks":
      return {
        items: [
          `Most creators miss this about ${snippet.slice(0, 40)}...`,
          "Stop rewriting from scratch every time you post.",
          "One idea can become five posts if you repurpose it right.",
          "This is the fastest way to stay consistent without burnout.",
          "If your content feels random, start here.",
        ],
      };
    case "caption":
      return {
        variants: [
          {
            text: `Here's the idea in one line: ${snippet}\n\nTurn one source into multiple posts and save hours every week.`,
            hashtags: ["#ContentAI", "#CreatorTools", "#RepurposeContent"],
          },
          {
            text: `Creators don't need more ideas—they need better workflows.\n\n${snippet}`,
            hashtags: ["#ContentStrategy", "#SocialMediaTips"],
          },
        ],
      };
    case "linkedin":
      return {
        post: `Most creators treat every post like a blank page.\n\n${snippet}\n\nThe better workflow: capture one strong idea, then repurpose it across formats.\n\nThat's how you stay consistent without burning out.`,
      };
    case "thread":
      return {
        tweets: [
          `Creators: one strong idea can become a week of content.\n\nHere's how to repurpose ${snippet.slice(0, 60)}... 🧵`,
          "Start with one source: a note, article, or voice memo.",
          "Extract the hook, the insight, and the takeaway.",
          "Turn those into carousel slides, hooks, and captions.",
          "Publish faster without losing quality.",
        ],
      };
  }
}

export async function generateFormatResult(
  ai: Ai | undefined,
  request: GenerationRequest,
  format: ContentFormat,
): Promise<NonNullable<FormatResults[ContentFormat]>> {
  if (!ai) {
    return buildMockResult(format, request.sourceContent);
  }

  const messages = buildPromptMessages(
    format,
    request.sourceContent,
    request.tone,
    request.ctaStyle,
  ) as AiMessage[];

  const response = await ai.run(AI_MODEL, {
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  const rawText = extractResponseText(response);
  return parseFormatResult(format, rawText) as NonNullable<
    FormatResults[ContentFormat]
  >;
}

export async function generateAllFormats(
  ai: Ai | undefined,
  request: GenerationRequest,
): Promise<FormatResults> {
  const entries = await Promise.all(
    request.formats.map(async (format) => {
      const result = await generateFormatResult(ai, request, format);
      return [format, result] as const;
    }),
  );

  return Object.fromEntries(entries) as FormatResults;
}
