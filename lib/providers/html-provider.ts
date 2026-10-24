import type { Movie, MovieProvider } from "./types";
import { parseMovieCatalog } from "./html-parser";
import { parseDetailPage, parseEpisodes } from "./html-detail-parser";

type HtmlProviderConfig = {
  id: string;
  name: string;
  catalogUrl: string;
  baseUrl: string;
  timeoutMs?: number;
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

  async function loadCatalog(): Promise<Movie[]> {
    const html = await fetchHtml(config.catalogUrl, timeoutMs);
    return parseMovieCatalog({
      providerId: config.id,
      baseUrl: config.baseUrl,
      html,
    });
  }

  return {
    id: config.id,
    name: config.name,

    async getCatalog(category) {
      const movies = await loadCatalog();
      return category
        ? movies.filter((movie) => movie.genres.includes(category))
        : movies;
    },

    async search(query) {
      const movies = await loadCatalog();
      const normalized = query.trim().toLowerCase();
      return movies.filter((movie) =>
        movie.title.toLowerCase().includes(normalized)
      );
    },

    async getDetails(id) {
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
  };
}
