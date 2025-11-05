import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if API key exists
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

// Export genAI instance or null if no API key
export const genAI: GoogleGenerativeAI | null = apiKey
  ? new GoogleGenerativeAI(apiKey)
  : null;

// Helper to check if Gemini is configured
export const isGeminiConfigured = (): boolean => {
  return genAI !== null;
};
