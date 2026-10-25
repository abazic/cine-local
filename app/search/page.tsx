import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { providers } from "@/lib/providers/registry";
import type { Movie } from "@/lib/providers/types";

async function SearchResults({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
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
        {q ? `Hasil untuk "${query}"` : "Ketik judul di kolom pencarian"}
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="px-6 pt-28 md:px-12">
        <Suspense
          fallback={<p className="text-zinc-400">Mencari...</p>}
        >
          <SearchResults query={q} />
        </Suspense>
      </div>
    </main>
  );
}
