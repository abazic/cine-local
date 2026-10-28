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
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
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

       async getCatalog(category, page = 1) {
      if (category) {
        const genreUrl = `${config.baseUrl}/genre/${category}`;
        const cachedGenre = unstable_cache(
          async () => {
            const html = await fetchHtml(genreUrl, timeoutMs);
            return parseMovieCatalog({
              providerId: config.id,
              baseUrl: config.baseUrl,
              html,
            });
          },
          [`genre-${config.id}-${category}`],
          { revalidate, tags: [`genre-${config.id}-${category}`] }
        );
        return cachedGenre();
      }

      if (page > 1) {
        const pageUrl = config.catalogUrl.replace(/\/page\/\d+$/, `/page/${page}`);
        const cachedPage = unstable_cache(
          async () => {
            const html = await fetchHtml(pageUrl, timeoutMs);
            return parseMovieCatalog({
              providerId: config.id,
              baseUrl: config.baseUrl,
              html,
            });
          },
          [`catalog-${config.id}-page-${page}`],
          { revalidate, tags: [`catalog-${config.id}`] }
        );
        return cachedPage();
      }

      return getCachedCatalog();
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
