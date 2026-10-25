"use client";

import type { Movie } from "@/lib/providers/types";
import { useWatchlist } from "@/lib/storage/watchlist";

export default function WatchlistButton({ movie }: { movie: Movie }) {
  const { has, toggle } = useWatchlist();
  const saved = has(movie);

  return (
    <button
      onClick={() => toggle(movie)}
      className={`mt-6 rounded px-6 py-2 font-semibold transition-colors ${
        saved
          ? "bg-zinc-700 text-white hover:bg-zinc-600"
          : "bg-white text-black hover:bg-zinc-300"
      }`}
    >
      {saved ? "✓ Ada di Daftar Saya" : "+ Tambah ke Daftar Saya"}
    </button>
  );
}
