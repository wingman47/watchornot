import React, { useMemo, useState } from "react";
import { MediaData, Episode } from "../../types";
import { fetchMediaData, fetchSuggestions } from "../services/tmdbService";

interface GraphViewProps {
  data: MediaData;
}

// Helper component for the grid
const HeatmapGrid: React.FC<{
  data: MediaData;
  getCellStyle: (rating: number) => string;
  onCellClick: (seasonNum: number, episode: Episode, event: React.MouseEvent) => void;
  onCellEnter: (e: React.MouseEvent, seasonNum: number, episode: Episode) => void;
  onCellLeave: () => void;
}> = ({ data, getCellStyle, onCellClick, onCellEnter, onCellLeave }) => {
  const { seasonMatrix, maxEpisodes } = useMemo(() => {
    if (!data.seasons) return { seasonMatrix: [], maxEpisodes: 0 };

    const sortedSeasons = [...data.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
    const matrix: { seasonNumber: number; episodes: (Episode | null)[] }[] = [];
    let maxEps = 0;

    sortedSeasons.forEach((season) => {
      const lastEpNum = season.episodes.length > 0
        ? Math.max(...season.episodes.map(e => e.episodeNumber))
        : 0;
      if (lastEpNum > maxEps) maxEps = lastEpNum;

      const episodes: (Episode | null)[] = [];
      for (let i = 1; i <= lastEpNum; i++) {
        const ep = season.episodes.find(e => e.episodeNumber === i);
        episodes.push(ep || null);
      }
      matrix.push({ seasonNumber: season.seasonNumber, episodes });
    });

    return { seasonMatrix: matrix, maxEpisodes: maxEps };
  }, [data]);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-block min-w-full">
        {/* Header Row: Episode Numbers */}
        <div className="flex">
          <div className="w-[30px] shrink-0"></div> {/* Spacer for Season Label */}
          {Array.from({ length: maxEpisodes }, (_, i) => i + 1).map((num) => (
            <div key={num} className="w-[36px] flex justify-center text-[8pt] text-[#828282] dark:text-[#888] font-bold mb-1">
              {num}
            </div>
          ))}
        </div>

        {/* Rows: Seasons */}
        <div className="flex flex-col gap-[1px] border border-[#828282] dark:border-white/20 bg-[#828282] dark:bg-white/20 w-fit">
          {seasonMatrix.map((season) => (
            <div key={season.seasonNumber} className="flex gap-[1px]">
              {/* Season Label */}
              <div className="w-[30px] shrink-0 flex items-center justify-center text-[8pt] font-bold text-black dark:text-white/80 bg-[#f6f6ef] dark:bg-[#1a1a1a]">
                S{season.seasonNumber}
              </div>

              {/* Episodes */}
              {Array.from({ length: maxEpisodes }).map((_, epIdx) => {
                const episode = season.episodes[epIdx];
                if (!episode) {
                  return <div key={epIdx} className="w-[36px] h-[30px] bg-[#f6f6ef] dark:bg-[#222]" />;
                }
                const bgColor = getCellStyle(episode.rating);
                return (
                  <div
                    key={epIdx}
                    className="w-[36px] h-[30px] cursor-pointer text-black text-[8pt] font-normal flex items-center justify-center hover:opacity-80 transition-opacity duration-75"
                    style={{ backgroundColor: bgColor }}
                    onClick={(e) => onCellClick(season.seasonNumber, episode, e)}
                    onMouseEnter={(e) => onCellEnter(e, season.seasonNumber, episode)}
                    onMouseLeave={onCellLeave}
                  >
                    {episode.rating.toFixed(1)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper to calculate stats
const calculateStats = (data: MediaData) => {
  if (!data.seasons) return {};
  let totalDuration = 0;
  let totalEpisodes = 0;
  let ratingSum = 0;

  data.seasons.forEach(s => {
    s.episodes.forEach(e => {
      totalEpisodes++;
      ratingSum += e.rating;
      if (e.runtime) totalDuration += e.runtime;
    });
  });

  return {
    totalDurationHours: Math.floor(totalDuration / 60),
    totalDurationMinutes: totalDuration % 60,
    averageRating: totalEpisodes > 0 ? ratingSum / totalEpisodes : 0,
    averageRuntime: totalEpisodes > 0 ? Math.round(totalDuration / totalEpisodes) : 0,
  };
};

// Reusable Series Info Component
const SeriesInfo: React.FC<{ data: MediaData }> = ({ data }) => {
  const stats = useMemo(() => calculateStats(data), [data]);

  const externalLinks = [
    { name: "IMDb", url: data.imdbId ? `https://www.imdb.com/title/${data.imdbId}/` : `https://www.imdb.com/find?q=${data.title}` },
    { name: "Reddit", url: `https://www.google.com/search?q=site:reddit.com ${data.title} discussion` },
    { name: "Letterboxd", url: `https://letterboxd.com/search/${data.title}/` },
    { name: "Rotten Tomatoes", url: `https://www.rottentomatoes.com/search?search=${data.title}` },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="flex gap-4">
        {data.posterUrl && (
          <img
            src={data.posterUrl}
            alt={`${data.title} Poster`}
            className="w-[80px] h-[120px] object-cover border border-[#828282] dark:border-[#333] shadow-sm"
          />
        )}
        <div>
          <h2 className="text-[14pt] font-medium text-black dark:text-dark-text mb-1">
            {data.title} <span className="text-[#828282] dark:text-dark-subtext text-[10pt]">({data.year})</span>
          </h2>
          <p className="text-[9pt] text-black dark:text-gray-300 mb-3 max-w-2xl leading-relaxed">{data.description}</p>

          {/* External Intelligence */}
          <div className="flex flex-wrap gap-3 mt-2">
            {externalLinks.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[8pt] font-bold text-[#828282] hover:text-hn-orange dark:text-gray-400 dark:hover:text-orange-500 uppercase tracking-wider border-b border-transparent hover:border-hn-orange dark:hover:border-orange-500 transition-colors"
              >
                {link.name} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[9pt] bg-[#f6f6ef] dark:bg-[#1e1e1e] p-4 min-w-[300px] border border-[#828282] dark:border-[#333]">
        <div>
          <p className="text-[#828282] dark:text-dark-subtext uppercase text-[7pt] tracking-wider mb-1">Rating</p>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-[18pt] text-hn-orange dark:text-orange-500 leading-none">
              {stats.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
            </span>
            <span className="text-[9pt] text-[#828282] dark:text-dark-subtext">/ 10</span>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-[#828282] dark:text-dark-subtext uppercase text-[7pt] tracking-wider">Total Time</p>
          <p className="font-bold text-[#000000] dark:text-white text-[10pt]">
            {stats.totalDurationHours}h {stats.totalDurationMinutes}m
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-[#828282] dark:text-dark-subtext uppercase text-[7pt] tracking-wider">Avg Ep Length</p>
          <p className="font-bold text-[#000000] dark:text-white text-[10pt]">
            {stats.averageRuntime} min
          </p>
        </div>
      </div>
    </div>
  );
};

// Binge Calculator Component
const BingeCalculator: React.FC<{ data: MediaData }> = ({ data }) => {
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(7);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all');

  const totalMinutes = useMemo(() => {
    if (!data.seasons) return 0;

    let seasonsToCalc = data.seasons;
    if (selectedSeason !== 'all') {
      seasonsToCalc = data.seasons.filter(s => s.seasonNumber === selectedSeason);
    }

    return seasonsToCalc.reduce((acc, s) => acc + s.episodes.reduce((eAcc, e) => eAcc + (e.runtime || 0), 0), 0);
  }, [data, selectedSeason]);

  const validationError = useMemo(() => {
    if (hoursPerDay > 24) return "Hours per day cannot exceed 24.";
    if (hoursPerDay <= 0) return "Hours per day must be positive.";
    if (daysPerWeek > 7) return "Days per week cannot exceed 7.";
    if (daysPerWeek <= 0) return "Days per week must be positive.";
    return null;
  }, [hoursPerDay, daysPerWeek]);

  const finishDate = useMemo(() => {
    if (!totalMinutes || validationError) return null;

    const hoursPerWeek = hoursPerDay * daysPerWeek;
    const totalHours = totalMinutes / 60;
    const weeksRequired = totalHours / hoursPerWeek;
    const daysRequired = weeksRequired * 7;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + Math.ceil(daysRequired));

    return end.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }, [totalMinutes, hoursPerDay, daysPerWeek, startDate, validationError]);

  if (!totalMinutes) return null;

  return (
    <div className="mt-6 p-4 bg-[#f6f6ef] dark:bg-[#1e1e1e] border border-[#828282] dark:border-[#333] max-w-xl">
      <h4 className="text-[10pt] font-bold text-black dark:text-white uppercase tracking-wider mb-3">
        Time to watch
      </h4>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-[8pt] text-[#828282] dark:text-gray-300 uppercase font-bold">Season</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="p-1 bg-white dark:bg-[#333] border border-gray-400 dark:border-[#555] text-black dark:text-white text-[10pt] outline-none focus:border-hn-orange dark:focus:border-orange-500 min-w-[100px]"
          >
            <option value="all">All Seasons</option>
            {data.seasons?.sort((a, b) => a.seasonNumber - b.seasonNumber).map(s => (
              <option key={s.seasonNumber} value={s.seasonNumber}>Season {s.seasonNumber}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[8pt] text-[#828282] dark:text-gray-300 uppercase font-bold">Hours / Day</label>
          <input
            type="number"
            min="0.5"
            max="24"
            step="0.5"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(parseFloat(e.target.value))}
            className="w-24 p-1 bg-white dark:bg-[#333] border border-gray-400 dark:border-[#555] text-black dark:text-white text-[10pt] outline-none focus:border-hn-orange dark:focus:border-orange-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[8pt] text-[#828282] dark:text-gray-300 uppercase font-bold">Days / Week</label>
          <input
            type="number"
            min="1"
            max="7"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(parseInt(e.target.value))}
            className="w-24 p-1 bg-white dark:bg-[#333] border border-gray-400 dark:border-[#555] text-black dark:text-white text-[10pt] outline-none focus:border-hn-orange dark:focus:border-orange-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[8pt] text-[#828282] dark:text-gray-300 uppercase font-bold">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-1 bg-white dark:bg-[#333] border border-gray-400 dark:border-[#555] text-black dark:text-white text-[10pt] outline-none focus:border-hn-orange dark:focus:border-orange-500"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-300 dark:border-[#444]">
        {validationError ? (
          <span className="text-[10pt] font-bold text-red-600 dark:text-red-400">
            {validationError}
          </span>
        ) : (
          <>
            <span className="text-[9pt] text-black dark:text-gray-300">You will finish on: </span>
            <span className="text-[11pt] font-bold text-hn-orange dark:text-orange-500 block sm:inline sm:ml-2">
              {finishDate || '...'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export const GraphView: React.FC<GraphViewProps> = ({ data }) => {
  // --- State for Comparison ---
  const [comparisonSeries, setComparisonSeries] = useState<MediaData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComparisonSearch, setShowComparisonSearch] = useState(false);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    season: number;
    episode: Episode;
  } | null>(null);

  // --- Color Logic ---
  const getCellStyle = (rating: number) => {
    if (rating >= 8.5) return '#2ad100ff';
    if (rating >= 7.6) return '#ffe600ff';
    if (rating >= 6.5) return '#fca311';
    return '#f12d2dff';
  };

  const getRatingTextColor = (rating: number) => {
    if (rating >= 8.5) return '#1b8700';
    if (rating >= 7.6) return '#d1bc00';
    if (rating >= 6.5) return '#c47e00';
    return '#b31b1b';
  };

  const handleCellClick = (seasonNum: number, episode: Episode, seriesData: MediaData, e: React.MouseEvent) => {
    if (e.shiftKey) {
      // Shift+Click -> IMDb
      if (seriesData.imdbId && seriesData.imdbId.startsWith('tt')) {
        window.open(`https://www.imdb.com/title/${seriesData.imdbId}/episodes?season=${seasonNum}`, '_blank');
      } else {
        const query = `${seriesData.title} season ${seasonNum} episode ${episode.episodeNumber} imdb`;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      }
      return;
    }

    // Default -> Search Reddit
    const query = `site:reddit.com ${seriesData.title} season ${seasonNum} episode ${episode.episodeNumber} discussion`;
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
  };

  // --- Search Logic ---
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      const suggs = await fetchSuggestions(query);
      setSuggestions(suggs);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSeries = async (query: string) => {
    setSearchQuery(query);
    setSuggestions([]);
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMediaData(query);
      if (result.type !== 'series') {
        setError('Please select a TV series, not a movie.');
        setComparisonSeries(null);
      } else {
        setComparisonSeries(result);
        setShowComparisonSearch(false); // Hide search after selection
      }
    } catch {
      setError('Failed to fetch series data.');
    } finally {
      setLoading(false);
    }
  };

  if (!data.seasons) return <div className="p-4">No data.</div>;

  return (
    <div className="w-full relative">
      {/* Expanded Show Info (Base Series) */}
      <div className="px-4 sm:px-8 md:px-12 mb-4">
        <SeriesInfo data={data} />
      </div>

      {/* Legend */}
      <div className="px-4 sm:px-8 md:px-12 mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-4 text-[9pt] font-bold text-white dark:text-black">
            <div className="text-[9pt] text-black dark:text-white/80">Rating Buckets:</div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3" style={{ backgroundColor: getCellStyle(9.0) }}></div>
              <span className="text-black dark:text-white/80 font-normal">8.5–10.0</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3" style={{ backgroundColor: getCellStyle(8.0) }}></div>
              <span className="text-black dark:text-white/80 font-normal">7.6–8.4</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3" style={{ backgroundColor: getCellStyle(7.0) }}></div>
              <span className="text-black dark:text-white/80 font-normal">6.5–7.5</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3" style={{ backgroundColor: getCellStyle(6.0) }}></div>
              <span className="text-black dark:text-white/80 font-normal">0.0–6.4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmaps Container */}
      <div className="px-4 sm:px-8 md:px-12 w-full pb-8">
        <div className="flex flex-col gap-12">
          {/* Base Series Heatmap */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[12pt] font-bold text-black dark:text-white mb-2">{data.title}</h3>
            <div className="text-[8pt] text-[#828282] dark:text-gray-500 font-normal italic mb-1">
              Tip: Click on episode for Reddit discussions
            </div>
            <HeatmapGrid
              data={data}
              getCellStyle={getCellStyle}
              onCellClick={(s, e, ev) => handleCellClick(s, e, data, ev)}
              onCellEnter={(e, s, ep) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({ x: rect.right, y: rect.top, season: s, episode: ep });
              }}
              onCellLeave={() => setTooltip(null)}
            />
            {/* Calculator for Base Series */}
            <BingeCalculator data={data} />
          </div>

          {/* Comparison Series Heatmap */}
          {comparisonSeries && (
            <div className="flex-1 min-w-0">
              <button
                onClick={() => setComparisonSeries(null)}
                className="text-[9pt] text-red-600 hover:underline self-start mt-1 mb-3"
              >
                Remove
              </button>
              <div className="flex items-center justify-between mb-4">
                <SeriesInfo data={comparisonSeries} />
              </div>

              <h3 className="text-[12pt] font-bold text-black dark:text-white mb-2">{comparisonSeries.title}</h3>
              <HeatmapGrid
                data={comparisonSeries}
                getCellStyle={getCellStyle}
                onCellClick={(s, e, ev) => handleCellClick(s, e, comparisonSeries, ev)}
                onCellEnter={(e, s, ep) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ x: rect.right, y: rect.top, season: s, episode: ep });
                }}
                onCellLeave={() => setTooltip(null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Comparison Controls */}
      <div className="px-4 sm:px-8 md:px-12 mb-12">
        {!comparisonSeries && !showComparisonSearch && (
          <button
            onClick={() => setShowComparisonSearch(true)}
            className="text-[10pt] text-black dark:text-white underline decoration-dotted hover:decoration-solid"
          >
            Compare with another series
          </button>
        )}

        {showComparisonSearch && !comparisonSeries && (
          <div className="mt-4 p-4 bg-[#f6f6ef] dark:bg-[#1e1e1e] border border-[#828282] dark:border-[#333] max-w-md">
            <h3 className="text-[10pt] font-bold text-black dark:text-white mb-2">Search Series to Compare</h3>
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="w-full px-2 py-1 bg-white dark:bg-[#2a2a2a] border border-gray-400 dark:border-[#444] text-black dark:text-white text-[10pt] outline-none focus:border-hn-orange"
                />
                {loading && <div className="text-[9pt] text-gray-500 flex items-center">Loading...</div>}
              </div>
              {suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-[1px] bg-white dark:bg-[#2a2a2a] border border-gray-400 dark:border-[#444] shadow-none max-h-60 overflow-auto">
                  {suggestions.map((s, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectSeries(s)}
                      className="px-2 py-1 hover:bg-[#f6f6ef] dark:hover:bg-[#3a3a3a] cursor-pointer text-black dark:text-gray-200 text-[10pt]"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              )}
              {error && <p className="text-red-600 text-[9pt] mt-1">{error}</p>}
              <button
                onClick={() => setShowComparisonSearch(false)}
                className="mt-2 text-[9pt] text-[#828282] hover:text-black dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-[#fffbf0] dark:bg-[#1e1e1e] border border-black dark:border-[#333] shadow-none p-2 min-w-[160px] pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(0px, -10px)'
          }}
        >
          <div className="text-black dark:text-white font-bold text-[10pt] mb-0.5">
            S{tooltip.season} E{tooltip.episode.episodeNumber}
          </div>
          <div className="text-black dark:text-gray-300 italic text-[9pt] mb-2 leading-tight">
            {tooltip.episode.title}
          </div>
          <div className="font-bold text-[10pt] mb-0.5" style={{ color: getRatingTextColor(tooltip.episode.rating) }}>
            Rating: {tooltip.episode.rating.toFixed(1)}
          </div>
          <div className="text-[#666] dark:text-gray-400 text-[9pt]">
            {tooltip.episode.runtime ? `${tooltip.episode.runtime} min` : 'N/A'}
          </div>
        </div>
      )}
    </div>
  );
};