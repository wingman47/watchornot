import React, { useMemo, useState } from "react";
import { MediaData, Episode } from "../types";

interface GraphViewProps {
  data: MediaData;
  isDarkMode: boolean;
}

// Flat Yellow Crown Icon with Black Outline (Plane 2D)
const CrownIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20" 
  >
    <path 
        d="M 4 18 L 20 18 L 22 6 L 16 12 L 12 4 L 8 12 L 2 6 Z" 
        fill="#FFD700" 
        stroke="black"
        strokeWidth="2"
        strokeLinejoin="round"
    />
  </svg>
);

export const GraphView: React.FC<GraphViewProps> = ({ data, isDarkMode }) => {
  const [hoveredEpisode, setHoveredEpisode] = useState<{
    season: number;
    episode: number;
    title: string;
    rating: number;
    runtime?: number;
    x: number;
    y: number;
  } | null>(null);

  // --- Data Processing ---
  const { 
    seasonMatrix, 
    maxEpisodes,
    globalStats,
    minRating,
    maxRating
  } = useMemo(() => {
    if (!data.seasons) return { 
      seasonMatrix: [], 
      maxEpisodes: 0, 
      globalStats: {}, 
      minRating: 0, 
      maxRating: 10 
    };

    const sortedSeasons = [...data.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
    const matrix: { seasonNumber: number; episodes: (Episode | null)[]; bestIdx: number; worstIdx: number }[] = [];
    let maxEps = 0;
    let totalDuration = 0;
    let totalEpisodes = 0;
    let ratingSum = 0;
    let gMin = 10;
    let gMax = 0;

    let globalBest = { rating: -1, season: -1, episode: -1 };
    let globalWorst = { rating: 11, season: -1, episode: -1 };

    sortedSeasons.forEach((season) => {
      const episodes: (Episode | null)[] = [];
      let sBest = { rating: -1, idx: -1 };
      let sWorst = { rating: 11, idx: -1 };
      
      // Find max episode number in this season to determine array length
      const lastEpNum = season.episodes.length > 0 
        ? Math.max(...season.episodes.map(e => e.episodeNumber)) 
        : 0;
      if (lastEpNum > maxEps) maxEps = lastEpNum;

      // Populate sparse array
      for (let i = 1; i <= lastEpNum; i++) {
        const ep = season.episodes.find(e => e.episodeNumber === i);
        if (ep) {
          episodes.push(ep);
          totalEpisodes++;
          ratingSum += ep.rating;
          if (ep.runtime) totalDuration += ep.runtime;
          if (ep.rating < gMin) gMin = ep.rating;
          if (ep.rating > gMax) gMax = ep.rating;

          // Season stats
          // Note: If ratings are equal, first occurrence keeps the crown/worst status
          if (ep.rating > sBest.rating) sBest = { rating: ep.rating, idx: i - 1 };
          if (ep.rating < sWorst.rating) sWorst = { rating: ep.rating, idx: i - 1 };
          
          // Global stats
          if (ep.rating > globalBest.rating) globalBest = { rating: ep.rating, season: season.seasonNumber, episode: ep.episodeNumber };
          if (ep.rating < globalWorst.rating) globalWorst = { rating: ep.rating, season: season.seasonNumber, episode: ep.episodeNumber };

        } else {
          episodes.push(null);
        }
      }
      matrix.push({ seasonNumber: season.seasonNumber, episodes, bestIdx: sBest.idx, worstIdx: sWorst.idx });
    });

    const safeMin = Math.max(0, gMin - 1);

    return {
      seasonMatrix: matrix,
      maxEpisodes: maxEps,
      minRating: safeMin,
      maxRating: gMax,
      globalStats: {
        totalDurationHours: Math.floor(totalDuration / 60),
        totalDurationMinutes: totalDuration % 60,
        averageRating: totalEpisodes > 0 ? ratingSum / totalEpisodes : 0,
        averageRuntime: totalEpisodes > 0 ? Math.round(totalDuration / totalEpisodes) : 0,
        best: globalBest,
        worst: globalWorst
      }
    };
  }, [data]);

  // --- Color Logic ---
  const getCellStyle = (rating: number, sBestIdx: number, sWorstIdx: number, currentIdx: number) => {
    const isBest = currentIdx === sBestIdx;
    const isWorst = currentIdx === sWorstIdx && !isBest; // prioritize best if single episode

    if (isWorst) return { bg: '#800000', isBest: false, isWorst: true }; // Maroon
    
    // Force yellow background for best episode
    if (isBest) return { bg: '#EAB308', isBest: true, isWorst: false }; // Darker yellow (Yellow-500)

    // Heatmap Gradient
    const range = 10 - minRating;
    const adjustedRating = Math.max(0, rating - minRating);
    const percent = range > 0 ? adjustedRating / range : 0.5;

    let color;
    if (isDarkMode) {
      // Dark Mode: Dark Gray -> Green
      if (percent < 0.2) color = '#2d2d2d'; 
      else if (percent < 0.4) color = '#1b4d1b';
      else if (percent < 0.6) color = '#2e7d32';
      else if (percent < 0.8) color = '#43a047';
      else color = '#66bb6a'; 
    } else {
      // Light Mode: Light Green -> Dark Green
      if (percent < 0.2) color = '#e8f5e9'; 
      else if (percent < 0.4) color = '#a5d6a7';
      else if (percent < 0.6) color = '#66bb6a';
      else if (percent < 0.8) color = '#2e7d32'; 
      else color = '#1b5e20'; 
    }
    
    return { bg: color, isBest: isBest, isWorst: false };
  };

  const handleCellClick = (seasonNum: number, episode: Episode) => {
    // Link to the season page for the main show ID. 
    // This avoids the issue where AI hallucinates incorrect individual episode IDs (tt-codes), 
    // which was causing links to open unrelated shows.
    if (data.imdbId && data.imdbId.startsWith('tt')) {
        window.open(`https://www.imdb.com/title/${data.imdbId}/episodes?season=${seasonNum}`, '_blank');
    } else {
        // Ultimate fallback to a Google search if main ID is missing
        const query = `${data.title} season ${seasonNum} episode ${episode.episodeNumber} imdb`;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, ep: Episode, seasonNum: number) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHoveredEpisode({
      season: seasonNum,
      episode: ep.episodeNumber,
      title: ep.title,
      rating: ep.rating,
      runtime: ep.runtime,
      // Fixed positioning relative to viewport (prevents misalignment on scroll)
      x: rect.left + rect.width / 2,
      y: rect.top
    });
  };

  if (!data.seasons) return <div className="p-4">No data.</div>;

  return (
    <div className="w-full">
      {/* Expanded Show Info */}
       <div className="px-4 sm:px-8 md:px-12 mb-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
                <h2 className="text-[16pt] font-medium text-black dark:text-dark-text mb-1">
                {data.title} <span className="text-[#828282] dark:text-dark-subtext text-[12pt]">({data.year})</span>
                </h2>
                <p className="text-[10pt] text-black dark:text-gray-300 mb-3 max-w-2xl leading-relaxed">{data.description}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[9pt] bg-white dark:bg-[#1e1e1e] p-3 border border-gray-200 dark:border-[#333] shadow-sm min-w-[300px]">
                <div>
                    <p className="text-[#828282] dark:text-dark-subtext uppercase text-[8pt] tracking-wider mb-1">IMDb Rating</p>
                     <div className="flex items-baseline gap-1">
                        <span className="font-bold text-[24pt] text-hn-green dark:text-[#66bb6a] leading-none">
                            {globalStats.averageRating ? globalStats.averageRating.toFixed(1) : "N/A"}
                        </span>
                        <span className="text-[10pt] text-[#828282] dark:text-dark-subtext">/ 10</span>
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[#828282] dark:text-dark-subtext uppercase text-[8pt] tracking-wider">Total Time</p>
                    <p className="font-bold text-[11pt]">{globalStats.totalDurationHours}h {globalStats.totalDurationMinutes}m</p>
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-[#828282] dark:text-dark-subtext uppercase text-[8pt] tracking-wider">Avg Ep Length</p>
                    <p className="font-bold text-[11pt]">{globalStats.averageRuntime} min</p>
                </div>
            </div>
        </div>
      </div>

      {/* Vertical Heatmap Container */}
      <div className="px-4 sm:px-8 md:px-12 w-full overflow-x-auto pb-8">
        <div className="inline-flex gap-[2px]">
            
            {/* Y-Axis Column (Episode Numbers) */}
            <div className="flex flex-col gap-[2px] min-w-[24px]">
                {/* Spacer to align with Season Headers (h=24px) */}
                <div className="h-[24px] flex-shrink-0"></div>

                {Array.from({ length: maxEpisodes }, (_, i) => i + 1).map((num) => (
                   <div key={num} className="h-[32px] flex items-center justify-end pr-2 text-[8pt] text-[#828282] dark:text-[#666]">
                     {num % 5 === 0 || num === 1 ? num : ''}
                   </div>
                ))}
            </div>

            {/* Season Columns */}
            {seasonMatrix.map((season) => (
                <div key={season.seasonNumber} className="flex flex-col gap-[2px] min-w-[42px]">
                    {/* Header */}
                    <div className="h-[24px] flex items-center justify-center text-[9pt] font-bold text-[#828282] dark:text-[#888]">
                        S{season.seasonNumber}
                    </div>

                    {/* Episodes for this season */}
                    {Array.from({ length: maxEpisodes }).map((_, epIdx) => {
                        const episode = season.episodes[epIdx];
                        if (!episode) {
                            // Empty cell placeholder
                            return <div key={epIdx} className="w-[42px] h-[32px] bg-transparent" />;
                        }

                        const { bg, isBest } = getCellStyle(episode.rating, season.bestIdx, season.worstIdx, epIdx);
                        
                        return (
                            <div 
                                key={epIdx}
                                className="w-[42px] h-[32px] cursor-pointer hover:brightness-110 relative group border border-black"
                                style={{ backgroundColor: bg }}
                                onClick={() => handleCellClick(season.seasonNumber, episode)}
                                onMouseEnter={(e) => handleMouseEnter(e, episode, season.seasonNumber)}
                                onMouseLeave={() => setHoveredEpisode(null)}
                            >
                                {isBest && <CrownIcon />}
                            </div>
                        );
                    })}
                </div>
            ))}

        </div>
      </div>
      
      {/* Custom Tooltip */}
      {hoveredEpisode && (
        <div 
            className={`fixed transform -translate-x-1/2 -translate-y-full pointer-events-none z-50 px-3 py-2 shadow-lg border text-[9pt] mb-2 ${
                isDarkMode ? 'bg-[#2a2a2a] border-[#444] text-gray-200' : 'bg-[#ffffee] border-[#828282] text-black'
            }`}
            style={{ left: hoveredEpisode.x, top: hoveredEpisode.y }}
        >
            <p className="font-bold whitespace-nowrap">S{hoveredEpisode.season} E{hoveredEpisode.episode}</p>
            <p className="italic text-xs mb-1 max-w-[200px] truncate">{hoveredEpisode.title}</p>
            <p className="font-bold text-hn-green">Rating: {hoveredEpisode.rating}</p>
            {hoveredEpisode.runtime && <p className="text-xs opacity-70">{hoveredEpisode.runtime} min</p>}
        </div>
      )}

      {/* Legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-6 text-[9pt] text-[#828282] dark:text-gray-500">
          <div className="flex items-center gap-2">
            <span>Rating:</span>
            <div className="flex gap-[2px]">
                <div className="w-3 h-3 bg-[#e8f5e9] dark:bg-[#2d2d2d] border border-black"></div>
                <div className="w-3 h-3 bg-[#66bb6a] dark:bg-[#2e7d32] border border-black"></div>
                <div className="w-3 h-3 bg-[#1b5e20] dark:bg-[#66bb6a] border border-black"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 relative flex items-center justify-center bg-[#EAB308] border border-black">
                 <CrownIcon />
              </div>
              <span>Best (Season)</span>
          </div>

          <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#800000] border border-black"></div>
              <span>Worst (Season)</span>
          </div>
      </div>
    </div>
  );
};