"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Movie } from "@/lib/providers/types";

export default function HeroBanner({ movies }: { movies: Movie[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (movies.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % movies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [movies.length]);

  const movie = movies[index];
  if (!movie) return null;

  return (
    <section className="relative flex h-[70vh] items-end overflow-hidden px-6 pb-16 md:px-12">
        {movie.poster && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${movie.poster})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              filter: "blur(2px) brightness(0.7) saturate(1.2)",
              transform: "scale(1.05)",
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
      <div className="relative max-w-xl">
        <h1 className="text-4xl font-extrabold md:text-6xl">{movie.title}</h1>
        <p className="mt-2 text-sm text-zinc-300">
          {movie.year} · {movie.genres.join(", ")}
        </p>
        {movie.overview && (
          <p className="mt-4 line-clamp-3 text-zinc-200">{movie.overview}</p>
        )}
        <Link
          href={`/title/${movie.id}`}
          className="mt-6 inline-block rounded bg-white px-6 py-2 font-semibold text-black hover:bg-zinc-300"
        >
          Lihat Detail
        </Link>
      </div>
      {movies.length > 1 && (
        <div className="absolute bottom-6 right-6 flex gap-2">
          {movies.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-zinc-500"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
