"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { FormatSelector } from "@/components/format-selector";
import { LoadingState } from "@/components/loading-state";
import { OutputTabs } from "@/components/output-tabs";
import { SourceInput } from "@/components/source-input";
import { ToneSelector } from "@/components/tone-selector";
import {
  appendLocalHistory,
  clearLastGeneration,
  loadLastGeneration,
  saveLastGeneration,
} from "@/lib/storage";
import {
  ContentFormat,
  CtaStyle,
  FormatResults,
  IngestResponse,
  SourceMode,
  Tone,
} from "@/lib/types";

const DEFAULT_FORMATS: ContentFormat[] = ["carousel", "hooks", "caption"];

export default function StudioPage() {
  const [cachedGeneration] = useState(() => loadLastGeneration());
  const [sourceContent, setSourceContent] = useState(
    cachedGeneration?.sourceContent ?? "",
  );
  const [sourceMode, setSourceMode] = useState<SourceMode>("text");
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [formats, setFormats] = useState<ContentFormat[]>(
    cachedGeneration?.formats ?? DEFAULT_FORMATS,
  );
  const [tone, setTone] = useState<Tone>(cachedGeneration?.tone ?? "casual");
  const [ctaStyle, setCtaStyle] = useState<CtaStyle>(
    cachedGeneration?.ctaStyle ?? "soft",
  );
  const [results, setResults] = useState<FormatResults>(
    cachedGeneration?.results ?? {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(Boolean(cachedGeneration));
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveIsError, setSaveIsError] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);

  async function handleExtractYoutube(url: string) {
    setIsExtracting(true);
    setExtractError(null);

    try {
      const response = await fetch("/api/ingest/youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = (await response.json()) as IngestResponse;

      if (!response.ok || !data.success || !data.sourceContent) {
        throw new Error(data.error ?? "Unable to extract the YouTube transcript.");
      }

      setSourceContent(data.sourceContent);
      setSourceLabel(data.sourceLabel ?? null);
      setResults({});
      setError(null);
      setRestored(false);
    } catch (ingestError) {
      setExtractError(
        ingestError instanceof Error
          ? ingestError.message
          : "Something went wrong while extracting the transcript.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleUploadFile(file: File) {
    setIsExtracting(true);
    setExtractError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ingest/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as IngestResponse;

      if (!response.ok || !data.success || !data.sourceContent) {
        throw new Error(data.error ?? "Unable to transcribe the uploaded file.");
      }

      setSourceContent(data.sourceContent);
      setSourceLabel(data.sourceLabel ?? null);
      setResults({});
      setError(null);
      setRestored(false);
    } catch (ingestError) {
      setExtractError(
        ingestError instanceof Error
          ? ingestError.message
          : "Something went wrong while transcribing the upload.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  async function handleGenerate() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceContent,
          formats,
          tone,
          ctaStyle,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        results: FormatResults;
        generationId?: string | null;
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Unable to generate content.");
      }

      setResults(data.results);
      setGenerationId(data.generationId ?? null);
      setSaveMessage(null);
      setSaveIsError(false);
      setRestored(false);
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Something went wrong while generating content.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveResult() {
    if (!hasResults) {
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);
    setSaveIsError(false);

    try {
      const savedEntry = {
        id: generationId ?? crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        sourceContent,
        formats,
        tone,
        ctaStyle,
        results,
      };

      saveLastGeneration(savedEntry);
      appendLocalHistory(savedEntry);

      const response = await fetch("/api/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceContent,
          formats,
          tone,
          ctaStyle,
          results,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        generationId?: string | null;
        savedToHistory?: boolean;
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Unable to save result.");
      }

      if (data.generationId) {
        setGenerationId(data.generationId);
      }

      setRestored(false);
      setSaveIsError(false);
      setSaveMessage(
        data.savedToHistory
          ? "Saved to history."
          : "Saved to history in this browser.",
      );
    } catch (saveError) {
      setSaveIsError(true);
      setSaveMessage(
        saveError instanceof Error
          ? saveError.message
          : "Something went wrong while saving.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleGenerateNew() {
    clearLastGeneration();
    setSourceContent("");
    setSourceMode("text");
    setSourceLabel(null);
    setFormats(DEFAULT_FORMATS);
    setTone("casual");
    setCtaStyle("soft");
    setResults({});
    setError(null);
    setRestored(false);
    setSaveMessage(null);
    setSaveIsError(false);
    setGenerationId(null);
    setExtractError(null);
  }

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Studio
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Paste text, drop in a YouTube URL, or upload a video — then choose your
          formats and generate structured content you can copy straight into your
          workflow.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <SourceInput
            value={sourceContent}
            onChange={setSourceContent}
            mode={sourceMode}
            onModeChange={setSourceMode}
            sourceLabel={sourceLabel}
            isExtracting={isExtracting}
            extractError={extractError}
            onExtractYoutube={handleExtractYoutube}
            onUploadFile={handleUploadFile}
          />
          <FormatSelector selected={formats} onChange={setFormats} />
          <ToneSelector
            tone={tone}
            ctaStyle={ctaStyle}
            onToneChange={setTone}
            onCtaStyleChange={setCtaStyle}
          />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={
                isLoading ||
                isExtracting ||
                !sourceContent.trim() ||
                formats.length === 0
              }
              className="inline-flex flex-1 items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
            >
              {isLoading ? "Generating..." : "Generate content"}
            </button>
          </div>
        </section>

        <section className="space-y-4">
          {restored && hasResults ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
              Restored your last successful generation from this browser.
            </div>
          ) : null}

          {error ? <ErrorState message={error} onRetry={handleGenerate} /> : null}

          {saveMessage ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                saveIsError
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              {saveMessage}
            </div>
          ) : null}

          {isLoading || isExtracting ? (
            <LoadingState
              message={
                isExtracting
                  ? "Extracting transcript from your source..."
                  : "Generating carousel, hooks, and captions..."
              }
            />
          ) : hasResults ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleSaveResult}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-medium text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save result"}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateNew}
                  className="inline-flex items-center justify-center rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
                >
                  Generate new
                </button>
              </div>
              <OutputTabs formats={formats} results={results} />
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </div>
  );
}
