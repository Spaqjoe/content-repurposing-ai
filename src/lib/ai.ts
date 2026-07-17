import {
  AI_MODEL,
  ContentFormat,
  FormatResults,
  GenerationRequest,
} from "./types";
import { buildPromptMessages } from "./prompts";
import { parseFormatResult } from "./formatters";
import { runWorkersAiRest, WorkersAiRestError } from "./workers-ai-rest";

type AiMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletionResult = {
  response?: string;
  text?: string;
  content?: string;
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

    if (record.response && typeof record.response === "object") {
      return JSON.stringify(record.response);
    }

    const choices = record.choices;
    if (Array.isArray(choices) && choices.length > 0) {
      const firstChoice = choices[0] as Record<string, unknown>;
      const message = firstChoice.message;
      if (message && typeof message === "object") {
        const content = (message as Record<string, unknown>).content;
        if (typeof content === "string" && content.trim()) {
          return content;
        }
      }
    }

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

async function runChatCompletion(
  ai: Ai | undefined,
  messages: AiMessage[],
): Promise<string> {
  if (ai) {
    const response = await ai.run(AI_MODEL, {
      messages,
      max_tokens: 1024,
      temperature: 0.3,
    });

    return extractResponseText(response);
  }

  const response = await runWorkersAiRest<
    {
      messages: AiMessage[];
      max_tokens: number;
      temperature: number;
    },
    ChatCompletionResult
  >(AI_MODEL, {
    messages,
    max_tokens: 1024,
    temperature: 0.3,
  });

  const rawText = extractResponseText(response);
  if (!rawText.trim()) {
    throw new WorkersAiRestError("The AI model returned an empty response.");
  }

  return rawText;
}

export async function generateFormatResult(
  ai: Ai | undefined,
  request: GenerationRequest,
  format: ContentFormat,
): Promise<NonNullable<FormatResults[ContentFormat]>> {
  const messages = buildPromptMessages(
    format,
    request.sourceContent,
    request.tone,
    request.ctaStyle,
  ) as AiMessage[];

  const rawText = await runChatCompletion(ai, messages);
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
