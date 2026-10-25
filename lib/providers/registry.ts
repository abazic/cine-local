import type { Movie, MovieProvider } from "./types";
import { demoProvider } from "./demo";
import { createHtmlProvider } from "./html-provider";

const lk21Url = process.env.CINE_LK21_URL?.trim();
const nontonDramaUrl = process.env.CINE_NONTONDRAMA_URL?.trim();

const htmlProviders: MovieProvider[] = [
  ...(lk21Url
    ? [
        createHtmlProvider({
          id: "lk21",
          name: "LK21",
          catalogUrl: `${lk21Url}/loadmore/latest-movies/page/1`,
          baseUrl: lk21Url,
        }),
      ]
    : []),
  ...(nontonDramaUrl
    ? [
        createHtmlProvider({
          id: "nontondrama",
          name: "NontonDrama",
          catalogUrl: `${nontonDramaUrl}/loadmore/latest-series/page/1`,
          baseUrl: nontonDramaUrl,
        }),
      ]
    : []),
];

export const providers: MovieProvider[] = [...htmlProviders, demoProvider];

export async function getUnifiedCatalog(category?: string): Promise<Movie[]> {
  const results = await Promise.allSettled(
    providers.map((provider) => provider.getCatalog(category))
  );

  const movies = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  const seen = new Set<string>();
  return movies.filter((movie) => {
    const key = `${movie.providerId}:${movie.detailUrl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
