import { FormatResults, GenerationRequest, HistoryRecord } from "./types";
import { summarizeResults } from "./formatters";

export async function saveGenerationToD1(
  db: D1Database | undefined,
  request: GenerationRequest,
  results: FormatResults,
): Promise<string | null> {
  if (!db) {
    return null;
  }

  const summary = summarizeResults(results);
  const id = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO generations (id, source_content, tone, formats_json, results_json, summary)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      request.sourceContent,
      request.tone,
      JSON.stringify(request.formats),
      JSON.stringify(results),
      summary,
    )
    .run();

  return id;
}

export async function getRecentGenerations(
  db: D1Database | undefined,
  limit = 20,
): Promise<HistoryRecord[]> {
  if (!db) {
    return [];
  }

  const result = await db
    .prepare(
      `SELECT id, created_at, source_content, tone, formats_json, results_json, summary
       FROM generations
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<HistoryRecord>();

  return result.results ?? [];
}

export async function getGenerationById(
  db: D1Database | undefined,
  id: string,
): Promise<HistoryRecord | null> {
  if (!db) {
    return null;
  }

  return db
    .prepare(
      `SELECT id, created_at, source_content, tone, formats_json, results_json, summary
       FROM generations
       WHERE id = ?
       LIMIT 1`,
    )
    .bind(id)
    .first<HistoryRecord>();
}
