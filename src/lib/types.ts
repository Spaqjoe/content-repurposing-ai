export const SUPPORTED_FORMATS = [
  "carousel",
  "hooks",
  "caption",
  "linkedin",
  "thread",
] as const;

export const SUPPORTED_TONES = [
  "professional",
  "casual",
  "bold",
  "educational",
  "hype",
] as const;

export const SUPPORTED_CTA_STYLES = ["soft", "direct", "none"] as const;

export type ContentFormat = (typeof SUPPORTED_FORMATS)[number];
export type Tone = (typeof SUPPORTED_TONES)[number];
export type CtaStyle = (typeof SUPPORTED_CTA_STYLES)[number];

export interface GenerationRequest {
  sourceContent: string;
  formats: ContentFormat[];
  tone: Tone;
  ctaStyle?: CtaStyle;
}

export interface CarouselResult {
  slides: string[];
}

export interface HooksResult {
  items: string[];
}

export interface CaptionVariant {
  text: string;
  hashtags?: string[];
}

export interface CaptionResult {
  variants: CaptionVariant[];
}

export interface LinkedInResult {
  post: string;
}

export interface ThreadResult {
  tweets: string[];
}

export type FormatResults = {
  carousel?: CarouselResult;
  hooks?: HooksResult;
  caption?: CaptionResult;
  linkedin?: LinkedInResult;
  thread?: ThreadResult;
};

export interface GenerationResponse {
  success: boolean;
  results: FormatResults;
  error?: string;
}

export interface StoredGeneration {
  id: string;
  createdAt: string;
  sourceContent: string;
  tone: Tone;
  formats: ContentFormat[];
  ctaStyle?: CtaStyle;
  results: FormatResults;
}

export interface HistoryRecord {
  id: string;
  created_at: string;
  source_content: string;
  tone: string;
  formats_json: string;
  results_json: string;
  summary: string | null;
}

export const FORMAT_LABELS: Record<ContentFormat, string> = {
  carousel: "Carousel",
  hooks: "Reel Hooks",
  caption: "Captions",
  linkedin: "LinkedIn Post",
  thread: "X Thread",
};

export const TONE_LABELS: Record<Tone, string> = {
  professional: "Professional",
  casual: "Casual",
  bold: "Bold",
  educational: "Educational",
  hype: "Hype",
};

export const CTA_LABELS: Record<CtaStyle, string> = {
  soft: "Soft CTA",
  direct: "Direct CTA",
  none: "No CTA",
};

export const MAX_SOURCE_LENGTH = 5000;

export const AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
export const WHISPER_MODEL = "@cf/openai/whisper-large-v3-turbo";

export const SOURCE_MODES = ["text", "youtube", "upload"] as const;
export type SourceMode = (typeof SOURCE_MODES)[number];

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const SUPPORTED_UPLOAD_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/webm",
  "audio/ogg",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
] as const;

export interface IngestResponse {
  success: boolean;
  sourceContent?: string;
  sourceLabel?: string;
  error?: string;
}
