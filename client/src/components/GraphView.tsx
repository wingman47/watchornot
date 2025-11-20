import React, { useMemo, useState } from "react";
import { MediaData, Episode } from "../../types";

// Note: The 'types' are assumed to be available but are not provided here.
// For the sake of this file, we assume MediaData and Episode are correctly defined.

interface GraphViewProps {
  data: MediaData;
  isDarkMode: boolean;
}

export const GraphView: React.FC<GraphViewProps> = ({ data, isDarkMode }) => {
  // --- Data Processing ---
  const { 
    seasonMatrix, 
    maxEpisodes,
    globalStats,
  } = useMemo(() => {
    if (!data.seasons) return { 
      seasonMatrix: [], 
      maxEpisodes: 0, 
      globalStats: {},
    };

    const sortedSeasons = [...data.seasons].sort((a, b) => a.seasonNumber - b.seasonNumber);
    const matrix: { seasonNumber: number; episodes: (Episode | null)[] }[] = [];
    let maxEps = 0;
    let totalDuration = 0;
    let totalEpisodes = 0;
    let ratingSum = 0;

    sortedSeasons.forEach((season) => {
      const episodes: (Episode | null)[] = [];
      
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
        } else {
          episodes.push(null);
        }
      }
      matrix.push({ seasonNumber: season.seasonNumber, episodes });
    });

    return {
      seasonMatrix: matrix,
      maxEpisodes: maxEps,
      globalStats: {
        totalDurationHours: Math.floor(totalDuration / 60),
        totalDurationMinutes: totalDuration % 60,
        averageRating: totalEpisodes > 0 ? ratingSum / totalEpisodes : 0,
        averageRuntime: totalEpisodes > 0 ? Math.round(totalDuration / totalEpisodes) : 0,
      }
    };
  }, [data]);

  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    season: number;
    episode: Episode;
  } | null>(null);

  // --- Color Logic (Based on fixed rating buckets from image) ---
  const getCellStyle = (rating: number) => {
    let color: string;
    
    // Using colors that match the image's vibrant, high-contrast look
    if (rating >= 8.5) {
      // 8.5 – 10.0 (Green)
      color = '#2ad100ff'; 
    } else if (rating >= 7.6) {
      // 7.6 – 8.4 (Orange)
      color = '#ffe600ff'; 
    } else if (rating >= 6.5) {
      // 6.5 – 7.5 (Yellowish-Orange)
      color = '#fca311'; 
    } else {
      // 0.0 – 6.4 (Red)
      color = '#f12d2dff'; 
    }
    
    return color;
  };

  // Helper to get text color for rating in tooltip (slightly darker for readability if needed, 
  // but for now using the same logic or a specific mapping)
  const getRatingTextColor = (rating: number) => {
     if (rating >= 8.5) return '#1b8700'; // Darker green
     if (rating >= 7.6) return '#d1bc00'; // Darker yellow/orange
     if (rating >= 6.5) return '#c47e00'; // Darker orange
     return '#b31b1b'; // Darker red
  };

  const handleCellClick = (seasonNum: number, episode: Episode) => {
    // Link to the season page for the main show ID. 
    if (data.imdbId && data.imdbId.startsWith('tt')) {
        window.open(`https://www.imdb.com/title/${data.imdbId}/episodes?season=${seasonNum}`, '_blank');
    } else {
        const query = `${data.title} season ${seasonNum} episode ${episode.episodeNumber} imdb`;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
  };

  if (!data.seasons) return <div className="p-4">No data.</div>;

  return (
    <div className="w-full relative">
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
                    <p className="text-[#828282] dark:text-dark-subtext uppercase text-[8pt] tracking-wider mb-1">Rating</p>
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
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-[9pt] font-bold text-white dark:text-black">
          <div className="text-[10pt] text-black dark:text-white/80">Rating Buckets:</div>
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


        <div className="inline-flex gap-[1px] border border-black dark:border-white">
            
            {/* Y-Axis Column (Episode Numbers) */}
            <div className="flex flex-col gap-[1px] min-w-[30px] bg-white dark:bg-[#1a1a1a]">
                {/* Header for Episode Numbers */}
                <div className="h-[20px] flex items-center justify-center text-[8pt] font-bold text-black dark:text-white/80 border-b border-black dark:border-white/80">
                   Ep
                </div>

                {Array.from({ length: maxEpisodes }, (_, i) => i + 1).map((num) => (
                   <div 
                      key={num} 
                      className="h-[30px] flex items-center justify-center text-[9pt] text-[#828282] dark:text-[#888] font-bold"
                   >
                     {num}
                   </div>
                ))}
            </div>

            {/* Season Columns */}
            {seasonMatrix.map((season) => (
                <div key={season.seasonNumber} className="flex flex-col gap-[1px] min-w-[36px]">
                    {/* Header: Season Number */}
                    <div className="h-[20px] flex items-center justify-center text-[9pt] font-bold text-black dark:text-white/80 bg-white dark:bg-[#1a1a1a] border-b border-black dark:border-white/80">
                        S{season.seasonNumber}
                    </div>

                    {/* Episodes for this season */}
                    {Array.from({ length: maxEpisodes }).map((_, epIdx) => {
                        const episode = season.episodes[epIdx];
                        
                        if (!episode) {
                            // Empty cell placeholder for missing episodes
                            return <div key={epIdx} className="w-[36px] h-[30px] bg-gray-100 dark:bg-[#222] opacity-50" />;
                        }

                        const bgColor = getCellStyle(episode.rating);
                        
                        return (
                            <div 
                                key={epIdx}
                                className="w-[36px] h-[30px] cursor-pointer text-black text-[9pt] font-semibold flex items-center justify-center hover:brightness-110 transition-all duration-100"
                                style={{ backgroundColor: bgColor }}
                                onClick={() => handleCellClick(season.seasonNumber, episode)}
                                onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setTooltip({
                                        x: rect.right,
                                        y: rect.top,
                                        season: season.seasonNumber,
                                        episode
                                    });
                                }}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                {/* Display Rating inside the cell */}
                                {episode.rating.toFixed(1)}
                            </div>
                        );
                    })}
                </div>
            ))}

        </div>
      </div>
      
      {/* Custom Tooltip */}
      {tooltip && (
        <div 
            className="fixed z-50 bg-[#fffbf0] dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#333] shadow-xl p-3 min-w-[160px] pointer-events-none"
            style={{ 
                left: tooltip.x, 
                top: tooltip.y,
                transform: 'translate(0px, -10px)' 
            }}
        >
            <div className="text-black dark:text-white font-bold text-[12pt] mb-0.5">
                S{tooltip.season} E{tooltip.episode.episodeNumber}
            </div>
            <div className="text-black dark:text-gray-300 italic text-[10pt] mb-2 leading-tight">
                {tooltip.episode.title}
            </div>
            <div className="font-bold text-[11pt] mb-0.5" style={{ color: getRatingTextColor(tooltip.episode.rating) }}>
                Rating: {tooltip.episode.rating.toFixed(1)}
            </div>
            <div className="text-[#666] dark:text-gray-400 text-[10pt]">
                {tooltip.episode.runtime ? `${tooltip.episode.runtime} min` : 'N/A'}
            </div>
        </div>
      )}
    </div>
  );
};