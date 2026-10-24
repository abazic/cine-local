import * as cheerio from "cheerio";
import type { Movie } from "./types";

type ParseOptions = {
  providerId: string;
  baseUrl: string;
  html: string;
};

export function parseMovieCatalog({ providerId, baseUrl, html }: ParseOptions): Movie[] {
  const $ = cheerio.load(html);
  const movies: Movie[] = [];
  const seen = new Set<string>();

  $("a[href]").each((_, element) => {
    const link = $(element);
    const image = link.find("img").first();
    const title =
      link.find("[itemprop=name]").first().text().trim() ||
      image.attr("alt")?.trim() ||
      link.attr("title")?.trim() ||
      link.text().trim();
    const href = link.attr("href");

    if (!title || !href || !image.length) return;

    let detailUrl: string;
    try {
      detailUrl = new URL(href, baseUrl).toString();
    } catch {
      return;
    }

    if (!["http:", "https:"].includes(new URL(detailUrl).protocol)) return;
    if (seen.has(detailUrl)) return;
    seen.add(detailUrl);

    const posterSrc = image.attr("data-src") || image.attr("data-lazy-src") || image.attr("src") || null;
    let poster: string | null = null;

    if (posterSrc) {
      try {
        const parsed = new URL(posterSrc, baseUrl);
        if (["http:", "https:"].includes(parsed.protocol)) poster = parsed.toString();
      } catch {
        poster = null;
      }
    }

    const card = link.closest("article").length
      ? link.closest("article")
      : link.parent();

    const text = card.text().replace(/\s+/g, " ").trim();
    const yearMatch = text.match(/\b(?:19|20)\d{2}\b/);
    const genreContent = card.find("meta[itemprop=genre]").attr("content");
    const genres = genreContent
      ? genreContent.split(",").map((genre) => genre.trim()).filter(Boolean)
      : card
          .find(".genre")
          .map((_, el) => $(el).text().trim())
          .get()
          .filter(Boolean);

    movies.push({
            id: new URL(detailUrl).pathname.split("/").filter(Boolean).pop() ?? encodeURIComponent(detailUrl),
      providerId,
      title,
      poster,
      overview: null,
      year: yearMatch ? Number(yearMatch[0]) : null,
      genres,
      detailUrl,
    });
  });

  return movies;
}
