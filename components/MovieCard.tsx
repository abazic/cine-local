import Link from "next/link";
import type { Movie } from "@/lib/providers/types";

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
           <Link href={`/title/${movie.id}`} className="group block w-28 shrink-0 sm:w-36 md:w-48">
      <div className="aspect-[2/3] overflow-hidden rounded-md bg-zinc-800 transition-transform duration-300 group-hover:scale-105">
        {movie.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-3 text-center text-sm font-semibold text-zinc-400">
            {movie.title}
          </div>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-medium">{movie.title}</p>
      <p className="truncate text-xs text-zinc-400">
        {movie.year} · {movie.genres.join(", ")}
      </p>
    </Link>
  );
}
