# Watch || Not

## Design

This project follows a brutalist design philosophy, similar to hackernews website. Please follow the same color scheme and layout.

## Project Overview

This project aims to visualize TMDb TV Series data through a heatmap of episodes based on their rating to decide whether to watch something or not.

## Tech Stack

### Client (Frontend)

*   **Framework:** React
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **Linting:** ESLint

### Server (Backend)

*   (Not yet implemented)

## File Structure

The project is divided into two main parts: `client` for the frontend and `server` for the backend.

### `client/` - Frontend Application

This directory contains the source code for the single-page application (SPA) that provides the user interface for interacting with the HN-IMDB graph data.

*   **Key Files and Directories:**
    *   `client/package.json`: Defines project metadata, scripts, and lists frontend dependencies.
    *   `client/index.html`: The main HTML entry point for the application.
    *   `client/src/main.tsx`: The primary TypeScript entry point where the React application is rendered.
    *   `client/src/App.tsx`: The root component of the React application, often containing routing and global layout.
    *   `client/src/components/`: Contains reusable React UI components:
        *   `HeatmapView.tsx`: Responsible for the heatmap based on the rating.
        *   `Header.tsx`: The application's header component.
        *   `MovieView.tsx`: Displays details related to TV series.
    *   `client/src/services/`: Houses logic for interacting with external APIs:
        *   `geminiService.ts`: Manages communication with the Google Gemini API.
        *   `tmdbService.ts`: Handles requests to The Movie Database (TMDb) API. You can see the standard API response from this file.
    *   `client/types.ts`: Contains TypeScript type definitions used across the client application.

### `server/` - Backend Application

Leave this currently.

## Folder Structure

```
/Users/arpitanand/Documents/hn-imdb-graph/
├───.gitignore
├───Gemini.md
├───.git/...
├───.vite/...
├───client/
│   ├───eslint.config.js
│   ├───index.html
│   ├───package-lock.json
│   ├───package.json
│   ├───tailwind.config.js
│   ├───tsconfig.app.json
│   ├───tsconfig.json
│   ├───tsconfig.node.json
│   ├───types.ts
│   ├───vite-env.d.ts
│   ├───vite.config.ts
│   ├───node_modules/...
│   ├───public/
│   │   └───vite.svg
│   └───src/
│       ├───App.css
│       ├───App.tsx
│       ├───index.css
│       ├───main.tsx
│       ├───assets/
│       │   └───react.svg
│       ├───components/
│       │   ├───GraphView.tsx
│       │   ├───Header.tsx
│       │   └───MovieView.tsx
│       └───services/
│           ├───geminiService.ts
│           └───tmdbService.ts
└───server/
    └───src/
```

## Getting Started (Client)

To run the client-side application:

1.  Navigate to the `client/` directory: `cd client/`
2.  Install dependencies: `npm install`
3.  Start the development server: `npm run dev`

This will typically open the application in your web browser at a local address.