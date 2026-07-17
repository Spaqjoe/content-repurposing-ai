import { summarizeResults } from "./formatters";
import { HistoryRecord, StoredGeneration } from "./types";

const STORAGE_KEY = "content-ai:last-generation";
const HISTORY_KEY = "content-ai:history";
const MAX_HISTORY = 50;

export function saveLastGeneration(data: StoredGeneration): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadLastGeneration(): StoredGeneration | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredGeneration;
  } catch {
    return null;
  }
}

export function clearLastGeneration(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function appendLocalHistory(data: StoredGeneration): void {
  if (typeof window === "undefined") {
    return;
  }

  const existing = loadLocalHistory().filter((entry) => entry.id !== data.id);
  const next = [data, ...existing].slice(0, MAX_HISTORY);
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function loadLocalHistory(): StoredGeneration[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(HISTORY_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredGeneration[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toHistoryRecord(entry: StoredGeneration): HistoryRecord {
  return {
    id: entry.id,
    created_at: entry.createdAt,
    source_content: entry.sourceContent,
    tone: entry.tone,
    formats_json: JSON.stringify(entry.formats),
    results_json: JSON.stringify(entry.results),
    summary: summarizeResults(entry.results),
  };
}

export function mergeHistoryRecords(
  remoteRecords: HistoryRecord[],
  localRecords: HistoryRecord[],
): HistoryRecord[] {
  const byId = new Map<string, HistoryRecord>();

  for (const record of localRecords) {
    byId.set(record.id, record);
  }

  for (const record of remoteRecords) {
    byId.set(record.id, record);
  }

  return Array.from(byId.values()).sort(
    (left, right) =>
      new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
  );
}
