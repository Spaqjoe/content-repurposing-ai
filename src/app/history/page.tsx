"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/copy-button";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { HistoryRecord } from "@/lib/types";

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        setRecords(data.records);
      } catch (historyError) {
        setError(
          historyError instanceof Error
            ? historyError.message
            : "Unable to load history.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
            History
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Recent generations saved to Cloudflare D1 when available.
          </p>
        </div>
        <Link
          href="/studio"
          className="inline-flex items-center justify-center rounded-full bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700"
        >
          Back to Studio
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Loading saved generations..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : records.length === 0 ? (
        <EmptyState
          title="No saved generations yet"
          description="Generate content in the studio to start building your history."
        />
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const expanded = expandedId === record.id;

            return (
              <article
                key={record.id}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-zinc-900">
                      {record.summary ?? "Generated content"}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                      {record.source_content}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Tone: {record.tone}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <CopyButton value={record.results_json} label="Copy JSON" />
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expanded ? null : record.id)
                      }
                      className="rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-300"
                    >
                      {expanded ? "Hide" : "View"}
                    </button>
                  </div>
                </div>

                {expanded ? (
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">
                    {JSON.stringify(JSON.parse(record.results_json), null, 2)}
                  </pre>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
