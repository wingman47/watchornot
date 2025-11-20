/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{ts,tsx,js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        hn: {
          bg: '#f6f6ef',
          green: '#2e7d32',
        },
        dark: {
          bg: '#121212',
          card: '#1e1e1e',
          border: '#333333',
          text: '#e0e0e0',
          subtext: '#9ca3af'
        }
      }
    }
  },
  plugins: [],
};
