import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { providers } from "@/lib/providers/registry";
import type { Movie } from "@/lib/providers/types";

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: rawQuery = "" } = await searchParams;
  const q = rawQuery.trim().toLowerCase();
  let results: Movie[] = [];

  if (q) {
    const settled = await Promise.allSettled(
      providers.map((p) => p.search(q))
    );
    const seen = new Set<string>();
    results = settled
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .filter((movie) => {
        const key = `${movie.providerId}:${movie.id}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  return (
    <>
      <h1 className="mb-6 text-xl font-semibold">
        {q ? `Hasil untuk "${rawQuery}"` : "Ketik judul di kolom pencarian"}
      </h1>
      {q && results.length === 0 && (
        <p className="text-zinc-400">Tidak ada judul yang cocok.</p>
      )}
      <div className="flex flex-wrap gap-4">
        {results.map((movie) => (
          <MovieCard key={`${movie.providerId}:${movie.id}`} movie={movie} />
        ))}
      </div>
    </>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="px-6 pt-28 md:px-12">
        <Suspense fallback={<p className="text-zinc-400">Mencari...</p>}>
          <SearchResults searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
