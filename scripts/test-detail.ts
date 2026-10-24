import { readFileSync } from "node:fs";
import { parseDetailPage, parseEpisodes } from "../lib/providers/html-detail-parser";

const html = readFileSync("/tmp/cine/detail.html", "utf8");

const detail = parseDetailPage(
  html,
  "https://tv9.nontondrama.my/doctor-x-age-white-mafia-2026",
  "lk21",
);
console.log("DETAIL:", JSON.stringify(detail, null, 2));

const episodes = parseEpisodes(html);
console.log("EPISODES:", JSON.stringify(episodes, null, 2));
