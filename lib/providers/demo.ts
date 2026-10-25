import type { Movie, MovieProvider } from "./types";

const movies: Movie[] = [
  { id: "1", providerId: "demo", title: "Midnight Harbor", poster: `https://placehold.co/400x600/18181b/ffffff?text=Movie`, overview: "Seorang detektif menyelidiki kasus hilangnya kapal di pelabuhan tua.", year: 2024, genres: ["Thriller", "Drama"], detailUrl: "/title/1" },
  { id: "2", providerId: "demo", title: "Neon Skies", poster: `https://placehold.co/400x600/18181b/ffffff?text=Movie`, overview: "Pilot muda menjelajahi kota futuristik yang dikuasai korporasi.", year: 2025, genres: ["Sci-Fi", "Action"], detailUrl: "/title/2" },
  { id: "3", providerId: "demo", title: "Warung Terakhir", poster: `https://placehold.co/400x600/18181b/ffffff?text=Movie`, overview: "Kisah hangat sebuah warung keluarga yang bertahan di tengah perubahan zaman.", year: 2023, genres: ["Drama", "Comedy"], detailUrl: "/title/3" },
  { id: "4", providerId: "demo", title: "The Quiet House", poster: `https://placehold.co/400x600/18181b/ffffff?text=Movie`, overview: "Keluarga baru pindah ke rumah yang menyimpan rahasia.", year: 2022, genres: ["Horror"], detailUrl: "/title/4" },
  { id: "5", providerId: "demo", title: "Summer in Cairo", poster: `https://placehold.co/400x600/18181b/ffffff?text=Movie`, overview: "Dua orang asing bertemu saat musim panas di Kairo.", year: 2025, genres: ["Romance"], detailUrl: "/title/5" },
  { id: "6", providerId: "demo", title: "Last Sprint", poster: `https://placehold.co/400x600/18181b/ffffff?text=Movie`, overview: "Atlet veteran mencoba comeback di kejuaraan terakhirnya.", year: 2024, genres: ["Sport", "Drama"], detailUrl: "/title/6" },
];

export const demoProvider: MovieProvider = {
  id: "demo",
  name: "Demo",
  async search(query) {
    const q = query.toLowerCase();
    return movies.filter((m) => m.title.toLowerCase().includes(q));
  },
  async getDetails(id) {
    return movies.find((m) => m.id === id) ?? null;
  },
  async getCatalog(category) {
    if (!category) return movies;
    return movies.filter((m) => m.genres.includes(category));
  },
};
