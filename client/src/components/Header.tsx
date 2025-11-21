import React, { useState, useEffect, useRef } from "react";
// import { fetchSuggestions } from "../services/geminiService";
import { fetchSuggestions } from "../services/tmdbService";

interface HeaderProps {
  onSearch: (query: string) => void;
  loading: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// Icons
const SunIcon = () => (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ onSearch, loading, isDarkMode, toggleTheme }) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // CHANGED: Use useRef instead of useState to prevent re-render loops
  const skipNextFetch = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // FIXED: Only one useEffect for fetching
  useEffect(() => {
    // If the user just clicked a suggestion, skip this fetch
    if (skipNextFetch.current) {
      skipNextFetch.current = false; // Reset the flag silently
      return;
    }

    const timer = setTimeout(async () => {
      if (inputValue.trim().length >= 2) {
        const results = await fetchSuggestions(inputValue);
        setSuggestions(results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]); // removed 'justSelected' from dependency

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (inputValue.trim()) {
      onSearch(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    skipNextFetch.current = true; // Set flag to skip the next useEffect run
    setInputValue(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  return (
    <header className="bg-hn-orange dark:bg-[#DB5816] p-[2px] flex items-center justify-between flex-wrap gap-2 relative z-50">
      <div className="flex items-center flex-grow gap-2">
        <div className="flex items-center gap-1 pl-1 shrink-0">
          <div className="bg-[#EAB308] text-black w-[25px] h-[25px] flex items-center justify-center text-[10pt] font-bold select-none border border-black">
            <svg viewBox="-12.66 0 156.313 156.313" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path id="movie_film" data-name="movie film" d="M354.338,697.239a9.554,9.554,0,0,0-1.9-1.466,21.028,21.028,0,0,1-3.2-35.409c.1-.091.2-.176.3-.271a9.571,9.571,0,0,0,0-13.533c-.1-.1-.2-.191-.3-.285l.005-.008L320.3,617.322a3.842,3.842,0,0,0-5.416,0L227.256,704.95a3.846,3.846,0,0,0,0,5.418L288.292,771.4a3.842,3.842,0,0,0,5.416,0l60.7-60.7,0,0A9.565,9.565,0,0,0,354.338,697.239Zm-48.4-62.469,8.939-8.944a3.245,3.245,0,0,1,4.585,0l8.71,8.711a3.244,3.244,0,0,1,0,4.586l-8.939,8.94a3.245,3.245,0,0,1-4.586,0l-8.709-8.711A3.238,3.238,0,0,1,305.935,634.77Zm-23.641,23.636,8.941-8.939a3.244,3.244,0,0,1,4.586,0l8.709,8.712a3.239,3.239,0,0,1,0,4.584l-8.938,8.939a3.245,3.245,0,0,1-4.587,0l-8.709-8.71A3.242,3.242,0,0,1,282.294,658.406Zm-25.041,51.635-8.941,8.939a3.242,3.242,0,0,1-4.583,0l-8.71-8.71a3.239,3.239,0,0,1,0-4.584l8.94-8.941a3.239,3.239,0,0,1,4.584,0l8.712,8.709A3.247,3.247,0,0,1,257.253,710.041Zm10.115-14.7-8.711-8.71a3.241,3.241,0,0,1,0-4.584l8.94-8.94a3.24,3.24,0,0,1,4.583,0l8.712,8.709a3.242,3.242,0,0,1,0,4.586l-8.94,8.939A3.24,3.24,0,0,1,267.368,695.34ZM301.913,754.7l-8.939,8.939a3.242,3.242,0,0,1-4.585,0l-8.71-8.71a3.245,3.245,0,0,1,0-4.586l8.939-8.94a3.247,3.247,0,0,1,4.586,0l8.709,8.71A3.243,3.243,0,0,1,301.913,754.7Zm23.64-23.64-8.94,8.94a3.239,3.239,0,0,1-4.585,0l-8.71-8.711a3.238,3.238,0,0,1,0-4.583l8.939-8.94a3.239,3.239,0,0,1,4.585,0l8.711,8.71A3.241,3.241,0,0,1,325.553,731.062Zm23.639-23.638-8.94,8.938a3.24,3.24,0,0,1-4.585,0l-8.71-8.711a3.24,3.24,0,0,1,0-4.584l8.94-8.939a3.242,3.242,0,0,1,4.585,0l8.711,8.709A3.245,3.245,0,0,1,349.192,707.424Z" transform="translate(-226.14 -616.205)" fill="#483b44"></path> </g></svg>
          </div>
          <span className="font-bold text-[10pt] text-black dark:text-white/90 leading-none pt-[1px] hidden sm:inline">
            Watch || Not
          </span>
        </div>

        <div className="flex-grow flex items-center relative max-w-md" ref={containerRef}>
          <form onSubmit={handleSubmit} className="flex gap-2 items-center w-full">
            <div className="relative w-full">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Search show or movie..."
                className="px-2 py-0.5 text-[10pt] w-full outline-none border border-gray-400 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                disabled={loading}
              />

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-white dark:bg-[#2a2a2a] border border-gray-400 dark:border-gray-600 mt-[1px] shadow-sm max-h-60 overflow-y-auto z-50">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-2 py-1 text-[10pt] text-black dark:text-gray-200 dark:hover:bg-[#3a3a3a] cursor-pointer"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="submit"
              className="text-black dark:text-white/90 p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black"
              disabled={loading}
              title="Search"
            >
              <SearchIcon />
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center gap-3 pr-2">
        <button
          onClick={toggleTheme}
          className="p-1 hover:opacity-80"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
};