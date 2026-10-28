import WatchlistButton from "@/components/WatchlistButton";
import HistoryTracker from "@/components/HistoryTracker";
import VideoPlayer from "@/components/VideoPlayer";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server"; // <-- 1. Import connection
import Navbar from "@/components/Navbar";
import { providers } from "@/lib/providers/registry";
import { getFreshStreamUrl } from "@/lib/providers/stream-extractor";

export default async function TitlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  await connection(); // <-- 2. Panggil di awal agar halaman dirender secara dinamis pada request time

  const { id } = await params;
  const { ep: selectedEpSlug } = await searchParams;

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

  let targetDetailUrl = movie.detailUrl;
  let activeEpisodeTitle = "";

  if (movie.kind === "series" && movie.episodes && movie.episodes.length > 0) {
    const currentEp = movie.episodes.find((e) => e.slug === selectedEpSlug) || movie.episodes[0];
    if (currentEp) {
      targetDetailUrl = new URL(
        currentEp.slug,
        movie.detailUrl.endsWith("/")
          ? movie.detailUrl
          : `${new URL(movie.detailUrl).origin}/`,
      ).toString();
    
      activeEpisodeTitle = `S${currentEp.season} E${currentEp.episode} — ${currentEp.title}`;
    }
  }

  const freshStreamUrl = await getFreshStreamUrl(targetDetailUrl);

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Navbar />
      <HistoryTracker movie={movie} />
      <div className="mx-auto max-w-4xl px-6 pt-28">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Kembali
        </Link>

        <div className="mt-6 mb-6">

          {freshStreamUrl?.type === "hls" ? (
            <VideoPlayer src={freshStreamUrl.url} />
          ) : freshStreamUrl?.type === "embed" ? (
            <iframe
              src={freshStreamUrl.url}
              title="Video player"
              className="aspect-video w-full rounded-md bg-black border-0"
              allow="autoplay; fullscreen; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="w-full aspect-video bg-zinc-900 flex flex-col items-center justify-center rounded-lg border border-zinc-800 text-zinc-400">
              <p className="font-semibold text-zinc-300">Video tidak tersedia di pemutar lokal</p>
              <p className="text-xs mt-1 text-zinc-500">
                Coba buka episode langsung di situs sumber.
              </p>
              <a
                href={targetDetailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
              >
                Tonton di Situs Sumber ↗
              </a>
            </div>
          )}

          {activeEpisodeTitle && (
            <p className="mt-2 text-sm text-zinc-400 font-medium">Memutar: {activeEpisodeTitle}</p>
          )}
        </div>

        <h1 className="mt-4 text-4xl font-extrabold">{movie.title}</h1>
        <p className="mt-2 text-zinc-400">
          {movie.year} · {movie.genres.join(", ")}
        </p>

        {movie.poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.poster}
            alt={movie.title}
            className="mt-6 max-h-[300px] w-auto rounded-lg object-contain"
          />
        )}

        <p className="mt-6 text-lg text-zinc-200">{movie.overview}</p>

        {movie.kind === "series" && movie.episodes && movie.episodes.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-xl font-semibold">Daftar Episode</h2>
            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {movie.episodes.map((ep) => {
                const isSelected = selectedEpSlug ? ep.slug === selectedEpSlug : ep === movie.episodes![0];
                return (
                  <li key={ep.slug}>
                    <Link
                      href={`/title/${id}?ep=${ep.slug}`}
                      className={`block rounded-lg px-4 py-3 text-sm transition-colors ${
                        isSelected
                          ? "bg-red-600 text-white font-bold"
                          : "bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      S{ep.season} E{ep.episode} — {ep.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <WatchlistButton movie={movie} />
        </div>
      </div>
    </main>
  );
}

// Tambahkan kembali baris ini agar Next.js mengizinkan blocking route dinamis
export const instant = false;
