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

function readRaw(): string {
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

function write(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useHistory() {
  const raw = useSyncExternalStore(subscribe, readRaw, getServerSnapshot);
  const list = useMemo(() => parse(raw), [raw]);

  // Selalu baca data terbaru dari localStorage, bukan dari variabel render
  const add = useCallback((movie: Movie) => {
    const current = parse(readRaw());
    const filtered = current.filter(
      (e) => !(e.movie.id === movie.id && e.movie.providerId === movie.providerId)
    );
    write(
      [{ movie, watchedAt: new Date().toISOString() }, ...filtered].slice(0, 50)
    );
  }, []);

  const remove = useCallback((movie: Movie) => {
    const current = parse(readRaw());
    write(
      current.filter(
        (e) => !(e.movie.id === movie.id && e.movie.providerId === movie.providerId)
      )
    );
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { list, add, remove, clear };
}

export type { HistoryEntry };
