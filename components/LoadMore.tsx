"use client";

import { useState, useTransition } from "react";
import MovieCard from "@/components/MovieCard";
import type { Movie } from "@/lib/providers/types";

type Props = {
  loadMore: (page: number) => Promise<Movie[]>;
};

export default function LoadMore({ loadMore }: Props) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(2);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const next = await loadMore(page);
      if (next.length === 0) {
        setDone(true);
        return;
      }
      setMovies((prev) => {
        const seen = new Set(prev.map((m) => `${m.providerId}:${m.id}`));
        return [...prev, ...next.filter((m) => !seen.has(`${m.providerId}:${m.id}`))];
      });
      setPage((p) => p + 1);
    });
  }

  return (
    <>
      {movies.map((movie) => (
        <MovieCard key={`${movie.providerId}:${movie.id}`} movie={movie} />
      ))}
      {!done && (
        <div className="mt-6 flex w-full justify-center pb-8">
          <button
            onClick={handleLoadMore}
            disabled={isPending}
            className="rounded bg-zinc-800 px-8 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {isPending ? "Memuat..." : "Muat Lebih"}
          </button>
        </div>
      )}
    </>
  );
}
