"use client";

import { useRef, useState } from "react";
import { MAX_SOURCE_LENGTH, SourceMode } from "@/lib/types";

interface SourceInputProps {
  value: string;
  onChange: (value: string) => void;
  mode: SourceMode;
  onModeChange: (mode: SourceMode) => void;
  sourceLabel: string | null;
  isExtracting: boolean;
  extractError: string | null;
  onExtractYoutube: (url: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
}

const MODE_OPTIONS: Array<{ id: SourceMode; label: string }> = [
  { id: "text", label: "Paste text" },
  { id: "youtube", label: "YouTube URL" },
  { id: "upload", label: "Upload video" },
];

export function SourceInput({
  value,
  onChange,
  mode,
  onModeChange,
  sourceLabel,
  isExtracting,
  extractError,
  onExtractYoutube,
  onUploadFile,
}: SourceInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  async function handleYoutubeExtract() {
    await onExtractYoutube(youtubeUrl);
  }

  async function handleUploadTranscribe() {
    if (!selectedFile) {
      return;
    }

    await onUploadFile(selectedFile);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {MODE_OPTIONS.map((option) => {
          const isActive = mode === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onModeChange(option.id)}
              className={`btn-press rounded-full px-3.5 py-1.5 font-mono text-xs font-medium transition ${
                isActive
                  ? "bg-accent-container text-white"
                  : "border border-white/10 bg-surface text-muted hover:border-white/20 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {mode === "text" ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="source-content"
              className="text-sm font-medium text-foreground"
            >
              Source content
            </label>
            <span className="font-mono text-xs text-outline">
              {value.length}/{MAX_SOURCE_LENGTH}
            </span>
          </div>
          <div className="relative">
            <textarea
              id="source-content"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Paste your script, podcast notes, or long-form blog post here..."
              maxLength={MAX_SOURCE_LENGTH}
              rows={12}
              className="input-field custom-scrollbar w-full resize-y rounded-xl px-4 py-3 text-sm leading-6"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full border border-white/5 bg-surface-highest px-2 py-1 font-mono text-[11px]">
              <span className="text-outline">Words:</span>
              <span className="font-bold text-accent-soft">{wordCount}</span>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "youtube" ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="youtube-url"
              className="text-sm font-medium text-foreground"
            >
              YouTube URL
            </label>
            <input
              id="youtube-url"
              type="url"
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="input-field w-full rounded-xl px-4 py-3 text-sm"
            />
            <p className="text-xs text-outline">
              Pulls captions from videos with subtitles enabled.
            </p>
          </div>

          <button
            type="button"
            onClick={handleYoutubeExtract}
            disabled={isExtracting || !youtubeUrl.trim()}
            className="btn-press inline-flex items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--accent)_35%,transparent)] bg-accent-container/15 px-4 py-2 text-sm font-medium text-accent-soft transition hover:bg-accent-container/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExtracting ? "Extracting transcript..." : "Extract transcript"}
          </button>
        </div>
      ) : null}

      {mode === "upload" ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <label
              htmlFor="media-upload"
              className="text-sm font-medium text-foreground"
            >
              Video or audio file
            </label>
            <input
              ref={fileInputRef}
              id="media-upload"
              type="file"
              accept="audio/*,video/*,.mp3,.mp4,.m4a,.wav,.webm,.mov,.ogg"
              onChange={handleFileChange}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accent-container/20 file:px-4 file:py-2 file:text-sm file:font-medium file:text-accent-soft hover:file:bg-accent-container/30"
            />
            <p className="text-xs text-outline">
              MP3, MP4, WAV, WEBM, MOV, M4A, or OGG up to 25 MB. Transcribed with
              Cloudflare Whisper.
            </p>
          </div>

          {selectedFile ? (
            <p className="rounded-xl border border-white/10 bg-surface px-4 py-3 text-xs text-muted">
              Selected:{" "}
              <span className="font-medium text-foreground">
                {selectedFile.name}
              </span>
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleUploadTranscribe}
            disabled={isExtracting || !selectedFile}
            className="btn-press inline-flex items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--accent)_35%,transparent)] bg-accent-container/15 px-4 py-2 text-sm font-medium text-accent-soft transition hover:bg-accent-container/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExtracting ? "Transcribing..." : "Transcribe upload"}
          </button>
        </div>
      ) : null}

      {extractError ? (
        <div className="rounded-xl border border-[color-mix(in_oklch,var(--error)_35%,transparent)] bg-error-container/40 px-4 py-3 text-sm text-error">
          {extractError}
        </div>
      ) : null}

      {value && mode !== "text" ? (
        <div className="space-y-2 border-t border-white/5 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Extracted transcript
              </p>
              {sourceLabel ? (
                <p className="text-xs text-outline">Source: {sourceLabel}</p>
              ) : null}
            </div>
            <span className="font-mono text-xs text-outline">
              {value.length}/{MAX_SOURCE_LENGTH}
            </span>
          </div>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            maxLength={MAX_SOURCE_LENGTH}
            rows={10}
            className="input-field custom-scrollbar w-full resize-y rounded-xl px-4 py-3 text-sm leading-6"
          />
          <p className="text-xs text-outline">
            Review and edit the transcript before generating content.
          </p>
        </div>
      ) : null}
    </div>
  );
}
