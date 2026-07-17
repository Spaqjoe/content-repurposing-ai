import {
  ContentFormat,
  CtaStyle,
  FormatResults,
  GenerationRequest,
  MAX_SOURCE_LENGTH,
  MAX_UPLOAD_BYTES,
  SUPPORTED_CTA_STYLES,
  SUPPORTED_FORMATS,
  SUPPORTED_TONES,
  SUPPORTED_UPLOAD_MIME_TYPES,
  Tone,
} from "./types";
import { extractYouTubeVideoId } from "./youtube";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function sanitizeText(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim();
}

export function normalizeTone(value: unknown): Tone {
  if (typeof value !== "string") {
    throw new ValidationError("Tone must be a string.");
  }

  const tone = value.toLowerCase() as Tone;
  if (!SUPPORTED_TONES.includes(tone)) {
    throw new ValidationError(
      `Unsupported tone. Choose one of: ${SUPPORTED_TONES.join(", ")}.`,
    );
  }

  return tone;
}

export function normalizeCtaStyle(value: unknown): CtaStyle {
  if (value === undefined || value === null || value === "") {
    return "soft";
  }

  if (typeof value !== "string") {
    throw new ValidationError("CTA style must be a string.");
  }

  const ctaStyle = value.toLowerCase() as CtaStyle;
  if (!SUPPORTED_CTA_STYLES.includes(ctaStyle)) {
    throw new ValidationError(
      `Unsupported CTA style. Choose one of: ${SUPPORTED_CTA_STYLES.join(", ")}.`,
    );
  }

  return ctaStyle;
}

export function normalizeFormats(value: unknown): ContentFormat[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new ValidationError("Select at least one output format.");
  }

  const formats = value.map((item) => {
    if (typeof item !== "string") {
      throw new ValidationError("Each format must be a string.");
    }

    const format = item.toLowerCase() as ContentFormat;
    if (!SUPPORTED_FORMATS.includes(format)) {
      throw new ValidationError(
        `Unsupported format "${item}". Choose from: ${SUPPORTED_FORMATS.join(", ")}.`,
      );
    }

    return format;
  });

  return Array.from(new Set(formats));
}

export function validateGenerationRequest(body: unknown): GenerationRequest {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const payload = body as Record<string, unknown>;
  const sourceContent = sanitizeText(String(payload.sourceContent ?? ""));

  if (!sourceContent) {
    throw new ValidationError("Source content is required.");
  }

  if (sourceContent.length > MAX_SOURCE_LENGTH) {
    throw new ValidationError(
      `Source content must be ${MAX_SOURCE_LENGTH} characters or fewer.`,
    );
  }

  return {
    sourceContent,
    formats: normalizeFormats(payload.formats),
    tone: normalizeTone(payload.tone),
    ctaStyle: normalizeCtaStyle(payload.ctaStyle),
  };
}

export function validateSaveRequest(body: unknown): {
  request: GenerationRequest;
  results: FormatResults;
} {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const payload = body as Record<string, unknown>;
  const request = validateGenerationRequest(payload);

  if (!payload.results || typeof payload.results !== "object") {
    throw new ValidationError("Results are required to save.");
  }

  const results = payload.results as FormatResults;
  if (Object.keys(results).length === 0) {
    throw new ValidationError("Nothing to save yet. Generate content first.");
  }

  return { request, results };
}

export function validateYouTubeIngestRequest(body: unknown): { url: string } {
  if (!body || typeof body !== "object") {
    throw new ValidationError("Request body must be a JSON object.");
  }

  const payload = body as Record<string, unknown>;
  const url = String(payload.url ?? "").trim();

  if (!url) {
    throw new ValidationError("YouTube URL is required.");
  }

  if (!extractYouTubeVideoId(url)) {
    throw new ValidationError("Enter a valid YouTube URL or video ID.");
  }

  return { url };
}

export function validateUploadFile(file: unknown): File {
  if (!(file instanceof File)) {
    throw new ValidationError("Upload a video or audio file to transcribe.");
  }

  if (file.size === 0) {
    throw new ValidationError("The uploaded file is empty.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new ValidationError("File must be 25 MB or smaller.");
  }

  const mimeType = file.type.toLowerCase();
  const isSupportedMime = SUPPORTED_UPLOAD_MIME_TYPES.some(
    (type) => type === mimeType,
  );
  const isSupportedExtension = /\.(mp3|mp4|m4a|wav|webm|mov|ogg)$/i.test(file.name);

  if (!isSupportedMime && !isSupportedExtension) {
    throw new ValidationError(
      "Unsupported file type. Upload MP3, MP4, WAV, WEBM, MOV, M4A, or OGG.",
    );
  }

  return file;
}

export function truncateSourceContent(value: string): string {
  const normalized = sanitizeText(value);
  if (normalized.length <= MAX_SOURCE_LENGTH) {
    return normalized;
  }

  return `${normalized.slice(0, MAX_SOURCE_LENGTH - 33).trim()}… [transcript truncated]`;
}
