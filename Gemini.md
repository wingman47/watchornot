# HN-IMDB Graph Project

## Project Overview

This project aims to visualize TMDb TV Series data through a heatmap of episodes based on their rating.

## File Structure

The project is divided into two main parts: `client` for the frontend and `server` for the backend.

### `client/` - Frontend Application

This directory contains the source code for the single-page application (SPA) that provides the user interface for interacting with the HN-IMDB graph data.

*   **Key Files and Directories:**
    *   `client/package.json`: Defines project metadata, scripts, and lists frontend dependencies.
    *   `client/index.html`: The main HTML entry point for the application.
    *   `client/index.tsx`: The primary TypeScript entry point where the React application is rendered.
    *   `client/App.tsx`: The root component of the React application, often containing routing and global layout.
    *   `client/components/`: Contains reusable React UI components:
        *   `GraphView.tsx`: Responsible for the heatmap based on the rating.
        *   `Header.tsx`: The application's header component.
        *   `MovieView.tsx`: Displays details related to TV series.
    *   `client/services/`: Houses logic for interacting with external APIs:
        *   `geminiService.ts`: Manages communication with the Google Gemini API.
        *   `tmdbService.ts`: Handles requests to The Movie Database (TMDb) API. You can see the standard API response from this file.
    *   `client/types.ts`: Contains TypeScript type definitions used across the client application.

### `server/` - Backend Application

Leave this currently.

## Getting Started (Client)

To run the client-side application:

1.  Navigate to the `client/` directory: `cd client/`
2.  Start the development server: `npm run dev`

This will typically open the application in your web browser at a local address.
