"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Plus,
  Trash,
  Briefcase,
  Camera,
  FilmStrip,
  TextAlignLeft,
  X,
} from "@phosphor-icons/react";
import { AppSidebar, PlatformFilter } from "@/components/app-sidebar";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { renderResult } from "@/components/format-renderer";
import { LoadingState } from "@/components/loading-state";
import { formatResultForCopy } from "@/lib/formatters";
import {
  loadLocalHistory,
  mergeHistoryRecords,
  toHistoryRecord,
} from "@/lib/storage";
import {
  ContentFormat,
  FORMAT_LABELS,
  FormatResults,
  HistoryRecord,
  SUPPORTED_FORMATS,
} from "@/lib/types";

function parseFormats(formatsJson: string): ContentFormat[] {
  try {
    const parsed = JSON.parse(formatsJson) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((format): format is ContentFormat =>
      SUPPORTED_FORMATS.includes(format as ContentFormat),
    );
  } catch {
    return [];
  }
}

function parseResults(resultsJson: string): FormatResults {
  try {
    return JSON.parse(resultsJson) as FormatResults;
  } catch {
    return {};
  }
}

function buildCopyAll(formats: ContentFormat[], results: FormatResults): string {
  return formats
    .filter((format) => results[format])
    .map((format) => {
      const result = results[format];
      if (!result) {
        return "";
      }
      return `## ${FORMAT_LABELS[format]}\n\n${formatResultForCopy(format, result)}`;
    })
    .filter(Boolean)
    .join("\n\n---\n\n");
}

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PlatformFilter>("all");
  const [toastVisible, setToastVisible] = useState(false);

  const viewingRecord = useMemo(
    () => records.find((record) => record.id === viewingId) ?? null,
    [records, viewingId],
  );

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/history");
        const data = (await response.json()) as {
          success: boolean;
          records: HistoryRecord[];
          error?: string;
        };

        if (!response.ok || !data.success) {
          throw new Error(data.error ?? "Unable to load history.");
        }

        const localRecords = loadLocalHistory().map(toHistoryRecord);
        setRecords(mergeHistoryRecords(data.records, localRecords));
      } catch (historyError) {
        const localRecords = loadLocalHistory().map(toHistoryRecord);
        if (localRecords.length > 0) {
          setRecords(localRecords);
        } else {
          setError(
            historyError instanceof Error
              ? historyError.message
              : "Unable to load history.",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  const filteredRecords = useMemo(() => {
    if (activeFilter === "all") {
      return records;
    }

    return records.filter((record) => {
      const formats = record.formats_json.toLowerCase();
      if (activeFilter === "instagram") {
        return formats.includes("carousel") || formats.includes("caption");
      }
      if (activeFilter === "reels") {
        return formats.includes("hooks");
      }
      if (activeFilter === "linkedin") {
        return formats.includes("linkedin");
      }
      if (activeFilter === "tiktok") {
        return formats.includes("thread") || formats.includes("hooks");
      }
      return true;
    });
  }, [records, activeFilter]);

  useEffect(() => {
    if (!viewingId) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setViewingId(null);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewingId]);

  function handleDelete(id: string) {
    setRecords((prev) => prev.filter((record) => record.id !== id));
    if (viewingId === id) {
      setViewingId(null);
    }
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 3500);
  }

  function formatCount(formatsJson: string) {
    try {
      const parsed = JSON.parse(formatsJson) as string[];
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }

  function formatIcons(formatsJson: string) {
    try {
      const parsed = JSON.parse(formatsJson) as string[];
      const icons = [];
      if (parsed.includes("carousel") || parsed.includes("caption")) {
        icons.push(<Camera key="ig" size={18} className="text-primary" />);
      }
      if (parsed.includes("hooks")) {
        icons.push(<FilmStrip key="reels" size={18} className="text-primary" />);
      }
      if (parsed.includes("linkedin")) {
        icons.push(<Briefcase key="li" size={18} className="text-primary" />);
      }
      if (parsed.includes("thread")) {
        icons.push(
          <TextAlignLeft key="thread" size={18} className="text-primary" />,
        );
      }
      return icons;
    } catch {
      return [];
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)]">
      <AppSidebar
        mode="filters"
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <main className="flex-1 px-4 py-6 md:ml-64 md:px-8 md:py-8">
        <header className="mb-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight text-accent-soft md:text-5xl">
            Generation History
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Review and manage your AI-driven content transformations.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 md:hidden">
            {(
              [
                ["all", "All"],
                ["instagram", "Instagram"],
                ["reels", "Reels"],
                ["linkedin", "LinkedIn"],
                ["tiktok", "TikTok"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveFilter(id)}
                className={`btn-press rounded-none px-3 py-1.5 font-mono text-xs font-medium transition ${
                  activeFilter === id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-surface text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {isLoading ? (
          <LoadingState message="Loading saved generations..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredRecords.length === 0 && records.length === 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            <EmptyState
              title="No saved generations yet"
              description="Generate content in the studio to start building your history."
            />
            <Link
              href="/studio"
              className="group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-none border-2 border-dashed border-border p-6 transition hover:border-[color-mix(in_oklch,var(--accent)_50%,transparent)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-none bg-surface-high text-outline transition group-hover:text-accent-soft">
                <Plus size={28} />
              </div>
              <span className="font-mono text-sm text-outline transition group-hover:text-accent-soft">
                Create New Generation
              </span>
            </Link>
          </div>
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            title="No matches for this filter"
            description="Try another platform filter or clear filters to see all generations."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredRecords.map((record) => {
              const count = formatCount(record.formats_json);
              const formats = parseFormats(record.formats_json);
              const results = parseResults(record.results_json);
              const copyAll = buildCopyAll(formats, results);

              return (
                <article
                  key={record.id}
                  className="glass-card flex flex-col gap-4 rounded-none p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-lg font-semibold text-foreground">
                        {record.summary ?? "Generated content"}
                      </h2>
                      <p className="mt-1 font-mono text-xs text-outline">
                        Saved {new Date(record.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {record.source_content}
                  </p>

                  <div className="flex items-center gap-2 border-y border-border py-3">
                    {formatIcons(record.formats_json)}
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {count} Format{count === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-auto flex gap-3">
                    <button
                      type="button"
                      onClick={() => setViewingId(record.id)}
                      className="btn-press flex flex-1 items-center justify-center gap-2 rounded-none bg-surface-highest py-2.5 font-mono text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <CopyButton
                      value={copyAll || record.results_json}
                      label="Copy All"
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      className="btn-press rounded-none border border-[color-mix(in_oklch,var(--error)_25%,transparent)] px-3 py-2 text-error transition hover:bg-error/10"
                      aria-label="Remove from view"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </article>
              );
            })}

            <Link
              href="/studio"
              className="group flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-none border-2 border-dashed border-border p-6 transition hover:border-[color-mix(in_oklch,var(--accent)_50%,transparent)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-none bg-surface-high text-outline transition group-hover:text-accent-soft">
                <Plus size={28} />
              </div>
              <span className="font-mono text-sm text-outline transition group-hover:text-accent-soft">
                Create New Generation
              </span>
            </Link>
          </div>
        )}
      </main>

      <div
        className={`glass-panel fixed right-6 bottom-6 z-50 flex items-center gap-3 rounded-none px-5 py-3 shadow-xl transition-transform duration-500 ${
          toastVisible ? "translate-y-0" : "translate-y-24"
        }`}
        aria-live="polite"
      >
        <Trash size={18} className="text-error" />
        <span className="text-sm text-foreground">
          Generation removed from view.
        </span>
      </div>

      {viewingRecord ? (
        <HistoryDetailDialog
          record={viewingRecord}
          onClose={() => setViewingId(null)}
        />
      ) : null}
    </div>
  );
}

function HistoryDetailDialog({
  record,
  onClose,
}: {
  record: HistoryRecord;
  onClose: () => void;
}) {
  const formats = parseFormats(record.formats_json);
  const results = parseResults(record.results_json);
  const copyAll = buildCopyAll(formats, results);
  const availableFormats = formats.filter((format) => results[format]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-detail-title"
        className="glass-panel relative z-10 flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-none border border-border shadow-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="history-detail-title"
              className="font-display text-xl font-semibold text-foreground sm:text-2xl"
            >
              {record.summary ?? "Generated content"}
            </h2>
            <p className="mt-1 font-mono text-xs text-outline">
              Saved {new Date(record.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CopyButton value={copyAll || record.results_json} label="Copy All" />
            <button
              type="button"
              onClick={onClose}
              className="btn-press rounded-none border border-border bg-surface-high p-2 text-muted-foreground transition hover:text-foreground"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          <p className="text-sm leading-6 text-muted-foreground">
            {record.source_content}
          </p>

          {availableFormats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No formatted results available for this generation.
            </p>
          ) : (
            availableFormats.map((format) => {
              const result = results[format];
              if (!result) {
                return null;
              }

              return (
                <section key={format} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-outline">
                      {FORMAT_LABELS[format]}
                    </h3>
                    <CopyButton
                      value={formatResultForCopy(format, result)}
                      label="Copy"
                    />
                  </div>
                  {renderResult(format, result)}
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
