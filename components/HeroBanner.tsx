import Link from "next/link";
import type { Movie } from "@/lib/providers/types";

export default function HeroBanner({ movie }: { movie: Movie }) {
  return (
    <section
      className="relative flex h-[70vh] items-end px-6 pb-16 md:px-12"
      style={
        movie.poster
          ? {
              backgroundImage: `url(${movie.poster})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      <div className="relative max-w-xl">
        <h1 className="text-4xl font-extrabold md:text-6xl">{movie.title}</h1>
        <p className="mt-2 text-sm text-zinc-300">
          {movie.year} · {movie.genres.join(", ")}
        </p>
        {movie.overview && (
          <p className="mt-4 text-zinc-200">{movie.overview}</p>
        )}
        <Link
          href={`/title/${movie.id}`}
          className="mt-6 inline-block rounded bg-white px-6 py-2 font-semibold text-black hover:bg-zinc-300"
        >
          Lihat Detail
        </Link>
      </div>
    </section>
  );
}
