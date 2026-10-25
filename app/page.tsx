import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import MovieCard from "@/components/MovieCard";
import { getUnifiedCatalog } from "@/lib/providers/registry";

async function CatalogContent() {
  const movies = await getUnifiedCatalog();

  return (
    <>
            <HeroBanner movie={movies.find((m) => m.poster) ?? movies[0]} />
      <section className="px-6 pt-8 md:px-12">
        <h2 className="mb-4 text-xl font-semibold">Baru Ditambahkan</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </>
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
      </Suspense>
    </main>
  );
}
