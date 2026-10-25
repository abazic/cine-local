export type Episode = {
  season: number;
  episode: number;
  title: string;
  slug: string;
};

export type Movie = {
  id: string;
  providerId: string;
  title: string;
  poster: string | null;
  overview: string | null;
  year: number | null;
  genres: string[];
  detailUrl: string;
  kind?: "movie" | "series";
  episodes?: Episode[];
};

export interface MovieProvider {
  id: string;
  name: string;
  search(query: string): Promise<Movie[]>;
  getDetails(id: string): Promise<Movie | null>;
    getCatalog(category?: string, page?: number): Promise<Movie[]>;
}
