export enum MediaType {
  SERIES = 'series',
  MOVIE = 'movie',
}

export interface Episode {
  episodeNumber: number;
  title: string;
  rating: number;
  overview?: string;
  runtime?: number; // minutes
  imdbId?: string;
}

export interface Season {
  seasonNumber: number;
  episodes: Episode[];
}

export interface MediaData {
  title: string;
  type: string; // 'series' | 'movie'
  year?: string;
  rating?: number; // For movies
  seasons?: Season[]; // For series
  description?: string;
  posterUrl?: string;
  imdbId?: string;
  tmdbId?: number;
}

export interface ChartDataPoint {
  name: string; // e.g. "S1E1"
  rating: number;
  title: string;
  season: number;
  episode: number;
  fullLabel: string;
  runtime?: number;
  globalIndex: number;
}