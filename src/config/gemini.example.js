// Gemini API Configuration
// Replace YOUR_GEMINI_API_KEY with your actual Gemini API key
export const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';

// You can get your API key from: https://makersuite.google.com/app/apikey
// Using v1 API for better compatibility and model support
export const GEMINI_MODEL = 'gemini-2.5-flash';
export const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;