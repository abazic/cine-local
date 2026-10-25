import { unstable_cache } from "next/cache";
import type { Movie, MovieProvider } from "./types";
import { parseMovieCatalog } from "./html-parser";
import { parseDetailPage, parseEpisodes } from "./html-detail-parser";

type HtmlProviderConfig = {
  id: string;
  name: string;
  catalogUrl: string;
  baseUrl: string;
  timeoutMs?: number;
  revalidate?: number;
};

async function fetchHtml(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "text/html" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

export function createHtmlProvider(config: HtmlProviderConfig): MovieProvider {
  const timeoutMs = config.timeoutMs ?? 8000;
  const revalidate = config.revalidate ?? 60 * 60; // default: 1 jam

  const getCachedCatalog = unstable_cache(
    async (): Promise<Movie[]> => {
      const html = await fetchHtml(config.catalogUrl, timeoutMs);
      return parseMovieCatalog({
        providerId: config.id,
        baseUrl: config.baseUrl,
        html,
      });
    },
    [`catalog-${config.id}`],
    { revalidate, tags: [`catalog-${config.id}`] }
  );

  const getCachedDetail = unstable_cache(
    async (id: string): Promise<Movie | null> => {
      const detailUrl = `${config.baseUrl}/${id}`;
      try {
        const html = await fetchHtml(detailUrl, timeoutMs);
        const detail = parseDetailPage(html, detailUrl, config.id);
        if (!detail) return null;
        const episodes = parseEpisodes(html);
        return { ...detail, episodes };
      } catch {
        return null;
      }
    },
    [`detail-${config.id}`],
    { revalidate, tags: [`detail-${config.id}`] }
  );

  return {
    id: config.id,
    name: config.name,

    async getCatalog(category) {
      const movies = await getCachedCatalog();
      return category
        ? movies.filter((movie) => movie.genres.includes(category))
        : movies;
    },

    async search(query) {
      const movies = await getCachedCatalog();
      const normalized = query.trim().toLowerCase();
      return movies.filter((movie) =>
        movie.title.toLowerCase().includes(normalized)
      );
    },

    async getDetails(id) {
      return getCachedDetail(id);
    },
  };
}
