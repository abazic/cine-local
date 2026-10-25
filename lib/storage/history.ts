"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Movie } from "@/lib/providers/types";

const KEY = "cine-local:history";
const EVENT = "cine-local:history-change";

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

type HistoryEntry = {
  movie: Movie;
  watchedAt: string; // ISO date string
};

function parse(raw: string): HistoryEntry[] {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function useHistory() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const list = useMemo(() => parse(raw), [raw]);

  const add = useCallback(
    (movie: Movie) => {
      const filtered = list.filter(
        (e) => !(e.movie.id === movie.id && e.movie.providerId === movie.providerId)
      );
      const next: HistoryEntry[] = [
        { movie, watchedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, 50); // simpan maksimal 50 entri
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    },
    [list]
  );

  const remove = useCallback(
    (movie: Movie) => {
      const next = list.filter(
        (e) => !(e.movie.id === movie.id && e.movie.providerId === movie.providerId)
      );
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      window.dispatchEvent(new Event(EVENT));
    },
    [list]
  );

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { list, add, remove, clear };
}

export type { HistoryEntry };
