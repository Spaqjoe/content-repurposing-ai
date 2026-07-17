import { StoredGeneration } from "./types";

const STORAGE_KEY = "content-ai:last-generation";

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
