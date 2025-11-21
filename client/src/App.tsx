import React, { useState, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { GraphView } from "./components/HeatmapView";
import { MovieView } from "./components/MovieView";
// import { fetchMediaData } from "./services/geminiService";
import { fetchMediaData } from "./services/tmdbService";
import { MediaData } from "../types";

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MediaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initial search for a popular show
  useEffect(() => {
    handleSearch("Breaking Bad");

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleSearch = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fetchMediaData(query);
      setData(result);
      setLoading(false);
    } catch (err) {
      setError("Could not fetch data. Please try again or try a different search.");
      console.error(err);
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-hn-bg dark:bg-dark-bg text-[10pt] pb-10">
      <Header
        onSearch={handleSearch}
        loading={loading}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <div className="max-w-5xl mx-auto min-h-[80vh] pt-2">
        {error && (
          <div className="px-4 py-4 text-red-600 dark:text-red-400 font-medium">
            Error: {error}
          </div>
        )}

        {loading && (
          <div className="px-4 py-10 text-center text-[#828282] dark:text-dark-subtext font-medium">
            Loading...
          </div>
        )}

        {!loading && !data && !error && (
          <div className="px-4 py-10 text-center text-[#828282] dark:text-dark-subtext">
            Search for a TV show to see the episode rating graph.
          </div>
        )}

        {!loading && data && (
          <div>
            {data.type === "series" ? (
              <GraphView data={data} />
            ) : (
              <MovieView data={data} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;