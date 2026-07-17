"use client";

import { useState } from "react";
import { FileText, MagicWand } from "@phosphor-icons/react";
import { AppSidebar } from "@/components/app-sidebar";
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

  function handleToggleFormat(formatId: string) {
    const format = formatId as ContentFormat;
    if (formats.includes(format)) {
      setFormats(formats.filter((item) => item !== format));
      return;
    }
    setFormats([...formats, format]);
  }

  const hasResults = Object.keys(results).length > 0;
  const resultCount = Object.keys(results).length;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)]">
      <AppSidebar
        mode="formats"
        selectedFormats={formats}
        onToggleFormat={handleToggleFormat}
      />

      <div className="flex w-full flex-1 flex-col md:ml-64 md:flex-row">
        {/* Left: Source */}
        <section className="flex w-full flex-col gap-4 border-b border-border p-4 md:w-1/3 md:border-r md:border-b-0 md:p-6">
          <div className="flex items-center gap-2">
            <FileText size={20} weight="fill" className="text-accent-soft" />
            <h1 className="font-display text-xl font-semibold text-foreground">
              Source Content
            </h1>
          </div>

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

          <div className="glass-panel rounded-none p-4">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-outline">
              AI Settings
            </p>
            <div className="flex items-center justify-between py-1">
              <span className="font-mono text-sm text-muted-foreground">Creative Tone</span>
              <span className="font-mono text-sm font-bold capitalize text-primary">
                {tone}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="font-mono text-sm text-muted-foreground">CTA Style</span>
              <span className="font-mono text-sm font-bold capitalize text-primary">
                {ctaStyle}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={
              isLoading ||
              isExtracting ||
              !sourceContent.trim() ||
              formats.length === 0
            }
            className="btn-press flex w-full items-center justify-center gap-2 rounded-none bg-primary px-6 py-3.5 font-mono text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MagicWand size={18} weight="fill" />
            {isLoading ? "Generating..." : "Generate Outputs"}
          </button>
        </section>

        {/* Right: Outputs */}
        <section className="custom-scrollbar flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6">
          <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Studio Output
                </h2>
                <p className="mt-1 text-sm text-outline">
                  {hasResults
                    ? `Generated ${resultCount} format${resultCount === 1 ? "" : "s"} based on your source.`
                    : "Your generated formats will show up here."}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-none border border-border bg-card px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="font-mono text-[11px] font-bold tracking-wider text-primary uppercase">
                  AI Engine Ready
                </span>
              </div>
            </div>

            {restored && hasResults ? (
              <div className="rounded-none border border-[color-mix(in_oklch,var(--accent)_30%,transparent)] bg-accent-container/15 px-4 py-3 text-sm text-accent-soft">
                Restored your last successful generation from this browser.
              </div>
            ) : null}

            {error ? <ErrorState message={error} onRetry={handleGenerate} /> : null}

            {saveMessage ? (
              <div
                className={`rounded-none border px-4 py-3 text-sm ${
                  saveIsError
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-primary/30 bg-accent text-accent-foreground"
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
                    className="btn-press inline-flex items-center justify-center rounded-none border border-primary/35 bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save result"}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateNew}
                    className="btn-press inline-flex items-center justify-center rounded-none bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  >
                    Generate new
                  </button>
                </div>
                <OutputTabs formats={formats} results={results} />
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
