import { WHISPER_MODEL } from "./types";
import {
  arrayBufferToBase64,
  getCloudflareRestCredentials,
  runWorkersAiRest,
  WorkersAiRestError,
} from "./workers-ai-rest";

interface WhisperResponse {
  text?: string;
  vtt?: string;
}

function extractTranscriptText(response: unknown): string {
  if (!response || typeof response !== "object") {
    return "";
  }

  const record = response as WhisperResponse;
  if (typeof record.text === "string" && record.text.trim()) {
    return record.text.trim();
  }

  if (typeof record.vtt === "string" && record.vtt.trim()) {
    return record.vtt
      .split("\n")
      .filter((line) => line && !line.startsWith("WEBVTT") && !line.includes("-->"))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "";
}

async function runWhisperTranscription(
  ai: Ai | undefined,
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<unknown> {
  if (ai) {
    return ai.run(WHISPER_MODEL, {
      audio: {
        body: buffer,
        contentType: mimeType,
      },
    });
  }

  const audio = arrayBufferToBase64(buffer);
  return runWorkersAiRest<
    {
      audio: string;
      language?: string;
    },
    WhisperResponse
  >(WHISPER_MODEL, {
    audio,
    language: "en",
  });
}

export async function transcribeMedia(
  ai: Ai | undefined,
  file: Blob,
  fileName: string,
): Promise<string> {
  const buffer = await file.arrayBuffer();
  const mimeType = file.type || "application/octet-stream";

  if (!ai && !getCloudflareRestCredentials()) {
    throw new WorkersAiRestError(
      `Unable to transcribe "${fileName}". Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .env.local, or run on Cloudflare Workers.`,
    );
  }

  const response = await runWhisperTranscription(ai, buffer, mimeType);
  const text = extractTranscriptText(response);

  if (!text) {
    throw new Error("Transcription completed but returned no text.");
  }

  return text.replace(/\s+/g, " ").trim();
}
