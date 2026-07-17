CREATE TABLE IF NOT EXISTS generations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  source_content TEXT NOT NULL,
  tone TEXT NOT NULL,
  formats_json TEXT NOT NULL,
  results_json TEXT NOT NULL,
  summary TEXT
);

CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
