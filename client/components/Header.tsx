import React, { useState, useEffect, useRef } from "react";
import { fetchSuggestions } from "../services/geminiService";

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

  // Debounce fetch suggestions
  useEffect(() => {
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
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (inputValue.trim()) {
      onSearch(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  return (
    <header className="bg-hn-green dark:bg-[#1b5e20] p-[2px] flex items-center justify-between flex-wrap gap-2 relative z-50 transition-colors duration-300">
      <div className="flex items-center flex-grow gap-2">
        <div className="flex items-center gap-1 pl-1 shrink-0">
          {/* Logo updated with black border */}
          <div className="bg-[#EAB308] text-black w-[20px] h-[20px] flex items-center justify-center text-[10pt] font-bold select-none border border-black">
            i
          </div>
          <span className="font-bold text-[10pt] text-black dark:text-white/90 leading-none pt-[1px] hidden sm:inline">
            IMDb Graph
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
                      className="px-2 py-1 text-[10pt] text-black dark:text-gray-200 hover:bg-hn-bg dark:hover:bg-[#3a3a3a] cursor-pointer"
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
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
};