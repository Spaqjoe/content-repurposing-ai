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
} from "@phosphor-icons/react";
import { AppSidebar, PlatformFilter } from "@/components/app-sidebar";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import {
  loadLocalHistory,
  mergeHistoryRecords,
  toHistoryRecord,
} from "@/lib/storage";
import { HistoryRecord } from "@/lib/types";

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<PlatformFilter>("all");
  const [toastVisible, setToastVisible] = useState(false);

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

  function handleDelete(id: string) {
    setRecords((prev) => prev.filter((record) => record.id !== id));
    if (expandedId === id) {
      setExpandedId(null);
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
              const expanded = expandedId === record.id;
              const count = formatCount(record.formats_json);

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
                      onClick={() =>
                        setExpandedId(expanded ? null : record.id)
                      }
                      className="btn-press flex flex-1 items-center justify-center gap-2 rounded-none bg-surface-highest py-2.5 font-mono text-sm text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                    >
                      <Eye size={16} />
                      {expanded ? "Hide" : "View"}
                    </button>
                    <CopyButton value={record.results_json} label="JSON" />
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id)}
                      className="btn-press rounded-none border border-[color-mix(in_oklch,var(--error)_25%,transparent)] px-3 py-2 text-error transition hover:bg-error/10"
                      aria-label="Remove from view"
                    >
                      <Trash size={16} />
                    </button>
                  </div>

                  {expanded ? (
                    <pre className="overflow-x-auto rounded-none bg-muted p-4 font-mono text-xs leading-6 text-muted-foreground">
                      {JSON.stringify(JSON.parse(record.results_json), null, 2)}
                    </pre>
                  ) : null}
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
    </div>
  );
}
