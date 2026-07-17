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
  clearLastGeneration,
  loadLastGeneration,
  saveLastGeneration,
} from "@/lib/storage";
import {
  ContentFormat,
  CtaStyle,
  FormatResults,
  Tone,
} from "@/lib/types";

const DEFAULT_FORMATS: ContentFormat[] = ["carousel", "hooks", "caption"];

function getInitialStudioState() {
  const cached = loadLastGeneration();

  return {
    sourceContent: cached?.sourceContent ?? "",
    formats: cached?.formats ?? DEFAULT_FORMATS,
    tone: cached?.tone ?? ("casual" as Tone),
    ctaStyle: cached?.ctaStyle ?? ("soft" as CtaStyle),
    results: cached?.results ?? {},
    restored: Boolean(cached),
  };
}

export default function StudioPage() {
  const initialState = getInitialStudioState();
  const [sourceContent, setSourceContent] = useState(initialState.sourceContent);
  const [formats, setFormats] = useState<ContentFormat[]>(initialState.formats);
  const [tone, setTone] = useState<Tone>(initialState.tone);
  const [ctaStyle, setCtaStyle] = useState<CtaStyle>(initialState.ctaStyle);
  const [results, setResults] = useState<FormatResults>(initialState.results);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState(initialState.restored);

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
        error?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Unable to generate content.");
      }

      setResults(data.results);
      saveLastGeneration({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        sourceContent,
        formats,
        tone,
        ctaStyle,
        results: data.results,
      });
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

  function handleClearSaved() {
    clearLastGeneration();
    setResults({});
    setRestored(false);
  }

  const hasResults = Object.keys(results).length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Studio
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Paste one source, choose your formats, and generate structured content
          you can copy straight into your workflow.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <SourceInput value={sourceContent} onChange={setSourceContent} />
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
              disabled={isLoading || !sourceContent.trim() || formats.length === 0}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
            >
              {isLoading ? "Generating..." : "Generate content"}
            </button>
            {hasResults ? (
              <button
                type="button"
                onClick={handleClearSaved}
                className="inline-flex items-center justify-center rounded-full border border-zinc-200 px-6 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-300"
              >
                Clear saved result
              </button>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          {restored && hasResults ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">
              Restored your last successful generation from this browser.
            </div>
          ) : null}

          {error ? <ErrorState message={error} onRetry={handleGenerate} /> : null}

          {isLoading ? (
            <LoadingState message="Generating carousel, hooks, and captions..." />
          ) : hasResults ? (
            <OutputTabs formats={formats} results={results} />
          ) : (
            <EmptyState />
          )}
        </section>
      </div>
    </div>
  );
}
