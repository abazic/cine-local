"use client";

import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { useHistory } from "@/lib/storage/history";

export default function HistoryPage() {
  const { list, clear } = useHistory();

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="px-6 pt-28 md:px-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Riwayat Tontonan</h1>
          {list.length > 0 && (
            <button
              onClick={clear}
              className="text-sm text-zinc-400 hover:text-white"
            >
              Hapus semua
            </button>
          )}
        </div>
        {list.length === 0 ? (
          <p className="text-zinc-400">Belum ada riwayat tontonan.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {list.map((entry) => (
              <MovieCard
                key={`${entry.movie.providerId}:${entry.movie.id}`}
                movie={entry.movie}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
