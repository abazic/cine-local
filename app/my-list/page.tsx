"use client";

import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { useWatchlist } from "@/lib/storage/watchlist";

export default function MyListPage() {
  const { list } = useWatchlist();

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="px-6 pt-28 md:px-12">
        <h1 className="mb-6 text-xl font-semibold">Daftar Saya</h1>
        {list.length === 0 ? (
          <p className="text-zinc-400">
            Belum ada judul. Buka halaman detail lalu tekan tombol tambah.
          </p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {list.map((movie) => (
              <MovieCard key={`${movie.providerId}:${movie.id}`} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
