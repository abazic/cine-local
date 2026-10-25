"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { Movie } from "@/lib/providers/types";

const KEY = "cine-local:watchlist";
const EVENT = "cine-local:watchlist-change";

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

function parse(raw: string): Movie[] {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const list = useMemo(() => parse(raw), [raw]);

  const has = useCallback(
    (movie: Movie) =>
      list.some((m) => m.id === movie.id && m.providerId === movie.providerId),
    [list]
  );

  const toggle = useCallback(
    (movie: Movie) => {
      const next = has(movie)
        ? list.filter(
            (m) => !(m.id === movie.id && m.providerId === movie.providerId)
          )
        : [...list, movie];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // storage penuh atau diblokir: abaikan
      }
      window.dispatchEvent(new Event(EVENT));
    },
    [list, has]
  );

  return { list, has, toggle };
}
