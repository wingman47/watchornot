import React from "react";
import { MediaData } from "../types";

interface MovieViewProps {
  data: MediaData;
}

export const MovieView: React.FC<MovieViewProps> = ({ data }) => {
  return (
    <div className="px-2 py-4 sm:px-4">
      <div className="bg-transparent">
        <h2 className="text-[14pt] text-black dark:text-dark-text font-medium mb-1">
          {data.title} <span className="text-[#828282] dark:text-dark-subtext text-[11pt]">({data.year})</span>
        </h2>
        <p className="text-[10pt] text-black dark:text-gray-300 mb-6 leading-relaxed max-w-3xl">{data.description}</p>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[10pt] text-[#828282] dark:text-dark-subtext">IMDb Rating:</span>
          <span className="text-[24pt] font-bold text-hn-green dark:text-[#66bb6a]">{data.rating?.toFixed(1) || "N/A"}</span>
          <span className="text-[10pt] text-[#828282] dark:text-dark-subtext">/ 10</span>
        </div>
      </div>
    </div>
  );
};