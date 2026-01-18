# Gemini API Setup

## Configuration

1. **Get Your Gemini API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Create a new API key

2. **Configure the API Key**
   - Open `src/config/gemini.js`
   - Replace `YOUR_GEMINI_API_KEY` with your actual API key:
   ```javascript
   export const GEMINI_API_KEY = 'your-actual-api-key-here';
   ```

## How It Works

- The AI summary is **not shown by default**
- Users must click the **"Show AI Summary"** button to generate it
- The summary is generated using Gemini API based on:
  - Product name and description
  - Order tracking history with timestamps
  - Time differences between milestones
- The AI provides a concise 2-3 sentence summary about the product and order journey

## Features

- ✅ On-demand AI summary generation
- ✅ Loading states during generation
- ✅ Error handling with user-friendly messages
- ✅ Professional summary based on product and tracking data
- ✅ Timeline still visible without AI summary

