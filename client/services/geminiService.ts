import { GoogleGenAI, Type } from "@google/genai";
import { MediaData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchMediaData = async (query: string): Promise<MediaData> => {
  const model = "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model,
    contents: `Search your internal database for the TV show or movie: "${query}". 
    Return a JSON object containing its IMDb ratings.
    If it is a TV Series, provide a list of ALL seasons and ALL episodes with their individual IMDb ratings and approximate runtime in minutes.
    
    CRITICAL: 
    1. Provide the correct IMDb ID for the Series (e.g., starting with 'tt').
    2. Be precise with ratings. If exact data is missing, estimate based on general reception but prefer accuracy.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Official title of the show or movie" },
          type: { type: Type.STRING, enum: ["series", "movie"], description: "Whether it is a series or a movie" },
          year: { type: Type.STRING, description: "Release year or range" },
          description: { type: Type.STRING, description: "Short synopsis" },
          rating: { type: Type.NUMBER, description: "Overall rating (if movie)" },
          imdbId: { type: Type.STRING, description: "The IMDb ID (e.g., tt0944947)" },
          seasons: {
            type: Type.ARRAY,
            description: "List of seasons (if series)",
            items: {
              type: Type.OBJECT,
              properties: {
                seasonNumber: { type: Type.NUMBER },
                episodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      episodeNumber: { type: Type.NUMBER },
                      title: { type: Type.STRING },
                      rating: { type: Type.NUMBER },
                      runtime: { type: Type.NUMBER, description: "Runtime in minutes" },
                    },
                    required: ["episodeNumber", "title", "rating"],
                  },
                },
              },
              required: ["seasonNumber", "episodes"],
            },
          },
        },
        required: ["title", "type", "year"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No data returned from Gemini");
  }

  try {
    return JSON.parse(response.text) as MediaData;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to process data");
  }
};

export const fetchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.trim().length < 2) return [];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest up to 5 TV show or movie titles that match or start with: "${query}". Return a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    if (!response.text) return [];
    return JSON.parse(response.text) as string[];
  } catch (e) {
    console.error("Suggestion fetch failed", e);
    return [];
  }
};