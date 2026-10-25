import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import MovieCard from "@/components/MovieCard";
import { getUnifiedCatalog, getGenreCatalog, catalogProviders } from "@/lib/providers/registry";
const GENRES = ["drama", "action", "horror", "romance", "comedy"];

async function CatalogContent() {
    const movies = (await getUnifiedCatalog()).filter((m) => m.providerId !== "demo");

  return (
    <>
            <HeroBanner movies={movies.filter((m) => m.poster).slice(0, 5)} />
      <section className="px-6 pt-8 md:px-12">
        <h2 className="mb-4 text-xl font-semibold">Baru Ditambahkan</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {movies.map((movie) => (
            <MovieCard key={`${movie.providerId}:${movie.id}`} movie={movie} />
          ))}
        </div>
      </section>
    </>
  );
}

async function GenreRow({ genre }: { genre: string }) {
  const movies = await getGenreCatalog(genre);
  if (movies.length === 0) return null;

  const label = genre.charAt(0).toUpperCase() + genre.slice(1);

  return (
    <section className="px-6 pt-8 md:px-12">
      <h2 className="mb-4 text-xl font-semibold">{label}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {movies.map((movie) => (
          <MovieCard key={`${movie.providerId}:${movie.id}`} movie={movie} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <Suspense
        fallback={
          <p className="px-6 pt-8 text-zinc-400 md:px-12">Memuat katalog...</p>
        }
      >
        <CatalogContent />
        {GENRES.map((genre) => (
          <Suspense key={genre} fallback={null}>
            <GenreRow genre={genre} />
          </Suspense>
        ))}
      </Suspense>
    </main>
  );
}
