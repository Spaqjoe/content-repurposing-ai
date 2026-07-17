import {
  CtaStyle,
  GenerationRequest,
  MAX_SOURCE_LENGTH,
  SUPPORTED_CTA_STYLES,
  SUPPORTED_FORMATS,
  SUPPORTED_TONES,
  Tone,
  ContentFormat,
} from "./types";

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
