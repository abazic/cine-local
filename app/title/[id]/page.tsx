import WatchlistButton from "@/components/WatchlistButton";
import HistoryTracker from "@/components/HistoryTracker";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { providers } from "@/lib/providers/registry";

export default async function TitlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const results = await Promise.allSettled(
    providers.map((provider) => provider.getDetails(id))
  );

  let movie = null;
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      movie = result.value;
      break;
    }
  }
  if (!movie) notFound();

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
            <HistoryTracker movie={movie} />
      <div className="mx-auto max-w-3xl px-6 pt-28">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Kembali
        </Link>
        <h1 className="mt-4 text-4xl font-extrabold">{movie.title}</h1>
        <p className="mt-2 text-zinc-400">
          {movie.year} · {movie.genres.join(", ")}
        </p>
        {movie.poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.poster}
            alt={movie.title}
            className="mt-6 max-h-[480px] w-auto rounded-lg object-contain"
          />
        )}
        <p className="mt-6 text-lg text-zinc-200">{movie.overview}</p>
        {movie.kind === "series" && movie.episodes && movie.episodes.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-xl font-semibold">Daftar Episode</h2>
            <ul className="space-y-2">
              {movie.episodes.map((ep) => (
                <li key={ep.slug} className="rounded-lg bg-zinc-900 px-4 py-3 text-sm text-zinc-200">
                  S{ep.season} E{ep.episode} — {ep.title}
                </li>
              ))}
            </ul>
          </div>
        )}
	<WatchlistButton movie={movie} />
      </div>
    </main>
  );
}


export const instant = false;
