/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  AI: Ai;
  DB: D1Database;
  ASSETS: Fetcher;
}
