import * as cheerio from "cheerio";
import type { Movie } from "./types";

export type MovieDetail = Movie & {
  kind: "movie" | "series";
};
export type Episode = {
  season: number;
  episode: number;
  title: string;
  slug: string;
};

export function parseEpisodes(html: string): Episode[] {
  const $ = cheerio.load(html);
  const raw = $('script[type="application/json"]').first().html();
  if (!raw) return [];

  try {
    const data = JSON.parse(raw) as Record<
      string,
      { s: number; episode_no: number; title: string; slug: string }[]
    >;
    return Object.values(data)
      .flat()
      .map((ep) => ({
        season: ep.s,
        episode: ep.episode_no,
        title: ep.title,
        slug: ep.slug,
      }));
  } catch {
    return [];
  }
}

const clean = (s: string | undefined | null) =>
  (s ?? "").replace(/\s+/g, " ").trim();

export function parseDetailPage(
  html: string,
  detailUrl: string,
  providerId: string,
): MovieDetail | null {
  const $ = cheerio.load(html);

  const rawTitle =
    clean($("h1").first().text()) ||
    clean($('meta[property="og:title"]').attr("content"));
  if (!rawTitle) return null;

  const title = rawTitle.replace(/\s*\(\d{4}\)\s*$/, "");

  const yearFromTitle = rawTitle.match(/\((\d{4})\)/)?.[1];
  const yearText = yearFromTitle || clean($(".year").first().text());
  const yearMatch = yearText.match(/\d{4}/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : null;

  const genres = [
    ...new Set(
      $('.tag-list a[href^="/genre/"]')
        .map((_, el) => clean($(el).text()))
        .get()
        .filter(Boolean),
    ),
  ];

  const overview =
    clean($(".synopsis").first().text()) ||
    clean($('meta[property="og:description"]').attr("content")) ||
    null;

  const poster = $('meta[property="og:image"]').attr("content") || null;

  const ogType = $('meta[property="og:type"]').attr("content");
  const kind: "movie" | "series" = ogType === "series" ? "series" : "movie";

  const slug = new URL(detailUrl).pathname.split("/").filter(Boolean).pop() ?? "";

  return {
    id: slug,
    providerId,
    title,
    poster,
    overview,
    year,
    genres,
    detailUrl,
    kind,
  };
}
