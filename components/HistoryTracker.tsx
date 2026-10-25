"use client";

import { useEffect } from "react";
import { useHistory } from "@/lib/storage/history";
import type { Movie } from "@/lib/providers/types";

export default function HistoryTracker({ movie }: { movie: Movie }) {
  const { add } = useHistory();

  useEffect(() => {
    add(movie);
  }, [movie.id]);

  return null;
}
