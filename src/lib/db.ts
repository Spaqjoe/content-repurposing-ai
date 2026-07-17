import { executeRemoteD1, isRemoteD1Available } from "./d1-remote";
import { FormatResults, GenerationRequest, HistoryRecord } from "./types";
import { summarizeResults } from "./formatters";

export async function saveGenerationToD1(
  db: D1Database | undefined,
  request: GenerationRequest,
  results: FormatResults,
): Promise<string | null> {
  const summary = summarizeResults(results);
  const id = crypto.randomUUID();

  if (db) {
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

  if (isRemoteD1Available()) {
    try {
      await executeRemoteD1(
        `INSERT INTO generations (id, source_content, tone, formats_json, results_json, summary)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          request.sourceContent,
          request.tone,
          JSON.stringify(request.formats),
          JSON.stringify(results),
          summary,
        ],
      );

      return id;
    } catch (error) {
      console.warn(
        `Remote D1 save failed. Using browser history only. (${
          error instanceof Error ? error.message : "Unknown remote D1 error"
        })`,
      );
    }
  }

  return null;
}

export async function getRecentGenerations(
  db: D1Database | undefined,
  limit = 20,
): Promise<HistoryRecord[]> {
  if (db) {
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

  if (isRemoteD1Available()) {
    try {
      return await executeRemoteD1<HistoryRecord>(
        `SELECT id, created_at, source_content, tone, formats_json, results_json, summary
         FROM generations
         ORDER BY created_at DESC
         LIMIT ?`,
        [limit],
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown remote D1 error";
      console.warn(
        `Remote D1 history fetch failed. Using browser history only. (${message})`,
      );
    }
  }

  return [];
}

export async function getGenerationById(
  db: D1Database | undefined,
  id: string,
): Promise<HistoryRecord | null> {
  if (db) {
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

  if (isRemoteD1Available()) {
    try {
      const records = await executeRemoteD1<HistoryRecord>(
        `SELECT id, created_at, source_content, tone, formats_json, results_json, summary
         FROM generations
         WHERE id = ?
         LIMIT 1`,
        [id],
      );

      return records[0] ?? null;
    } catch (error) {
      console.warn("Remote D1 lookup failed.", error);
    }
  }

  return null;
}
