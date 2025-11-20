import React, { useState, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { GraphView } from "./components/GraphView";
import { MovieView } from "./components/MovieView";
// import { fetchMediaData } from "./services/geminiService";
import { fetchMediaData } from "./services/tmdbService";
import { MediaData } from "../types";

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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
    setProgress(0);

    // Simulate progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Stall at 90%
        // Random increment to make it look natural
        const increment = Math.random() * 8 + 2; 
        return Math.min(prev + increment, 90);
      });
    }, 150);

    try {
      const result = await fetchMediaData(query);
      
      clearInterval(timer);
      setProgress(100);

      // Wait for 100% animation to finish before showing content
      setTimeout(() => {
        setData(result);
        setLoading(false);
      }, 600);
      
    } catch (err) {
      clearInterval(timer);
      setError("Could not fetch data. Please try again or try a different search.");
      console.error(err);
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-hn-bg dark:bg-dark-bg text-[10pt] pb-10 transition-colors duration-300">
      <Header 
        onSearch={handleSearch} 
        loading={loading} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
      />

      <div className="max-w-5xl mx-auto min-h-[80vh]">
        {error && (
          <div className="px-4 py-4 text-red-600 dark:text-red-400 font-medium">
            Error: {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] w-full gap-3">
             <div className="w-[280px] sm:w-[350px] border-2 border-black dark:border-white p-1">
                <div 
                  className="h-6 bg-hn-green dark:bg-[#4caf50]"
                  style={{ width: `${progress}%` }}
                />
             </div>
             <div className="font-mono text-xs font-bold text-black dark:text-white uppercase tracking-widest">
               Loading... {Math.floor(progress)}%
             </div>
          </div>
        )}

        {!loading && !data && !error && (
           <div className="px-4 py-10 text-center text-[#828282] dark:text-dark-subtext">
               Search for a TV show to see the episode rating graph.
           </div>
        )}

        {!loading && data && (
          <div className="animate-fade-in">
            {data.type === "series" ? (
              <GraphView data={data} isDarkMode={isDarkMode} />
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