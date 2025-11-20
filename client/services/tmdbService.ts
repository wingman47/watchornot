import axios from "axios";
import { MediaData } from "../types";

const TMDB_KEY = import.meta.env.VITE_TMDB_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const OMDB_KEY = import.meta.env.VITE_OMDB_KEY; // optional

const api = axios.create({
  baseURL: TMDB_BASE,
  params: { api_key: TMDB_KEY },
});

const fetchImdbRating = async (imdbId: string) => {
  if (!OMDB_KEY) return null;
  try {
    const r = await axios.get("https://www.omdbapi.com/", {
      params: { apikey: OMDB_KEY, i: imdbId },
    });
    return r.data.imdbRating ? Number(r.data.imdbRating) : null;
  } catch {
    return null;
  }
};

export const fetchMediaData = async (query: string): Promise<MediaData> => {
  const search = await api.get("/search/multi", { params: { query } });
  if (!search.data.results.length) throw new Error("No results");

  const item = search.data.results[0];
  const type = item.media_type === "tv" ? "series" : "movie";

  // MOVIE
  if (type === "movie") {
    const m = await api.get(`/movie/${item.id}`);
    const imdbId = m.data.imdb_id;
    const rating = imdbId ? await fetchImdbRating(imdbId) : null;

    return {
      title: m.data.title,
      type: "movie",
      year: String(m.data.release_date?.slice(0, 4) || ""),
      description: m.data.overview,
      imdbId,
      rating: rating || null,
    };
  }

  // SERIES
  const tv = await api.get(`/tv/${item.id}`);
  const imdbId = tv.data.external_ids?.imdb_id;
  const seasons: any[] = [];

  for (const s of tv.data.seasons) {
    const sid = s.season_number;
    if (sid === 0) continue;

    const sd = await api.get(`/tv/${item.id}/season/${sid}`);
    seasons.push({
      seasonNumber: sid,
      episodes: sd.data.episodes.map((e: any) => ({
        episodeNumber: e.episode_number,
        title: e.name,
        rating: e.vote_average || null, // TMDB rating
        runtime: e.runtime || tv.data.episode_run_time?.[0] || 0,
      })),
    });
  }

  return {
    title: tv.data.name,
    type: "series",
    year: `${tv.data.first_air_date?.slice(0, 4) || ""}`,
    description: tv.data.overview,
    imdbId,
    seasons,
  };
};

export const fetchSuggestions = async (query: string): Promise<string[]> => {
  if (!query.trim() || query.length < 2) return [];

  try {
    const r = await api.get("/search/multi", {
      params: { query },
    });

    return r.data.results
      .filter((x: any) => x.media_type === "tv" || x.media_type === "movie")
      .slice(0, 7)
      .map((x: any) => x.name || x.title)
      .filter(Boolean);
  } catch (e) {
    console.error("Suggestion fetch failed", e);
    return [];
  }
};
