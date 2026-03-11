# MemoAid - Complete Setup & Feature Guide

## 🗺️ Google Maps Timeline + 🤖 AI Summarizer Features

### Part 1: Google Maps API Setup

#### Step 1: Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Maps Embed API**
4. Go to **Credentials** → **Create API Key**
5. Copy your API key

#### Step 2: Configure Frontend
1. Create `.env.local` file in project root (same level as `package.json`)
2. Add this line:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
   ```
3. Replace `YOUR_API_KEY_HERE` with your actual key
4. Restart the frontend (`npm run dev`)

### Part 2: Google Generative AI (Gemini) Setup for Summarization

#### Step 1: Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Choose your existing or create new Google Cloud Project
4. Copy the generated API key

#### Step 2: Configure Backend
1. Open `backend/.env` file
2. Replace:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```
   With your actual Gemini API key
3. Restart backend (`npm start` in backend folder)

### Part 3: Features & How to Use

#### ✨ Feature 1: Google Maps Timeline View
**What it does:** Shows your journey on an interactive Google Map with markers and connecting path

**How to use:**
1. Click the 🗓️ Calendar icon (orange button)
2. Click "View Timeline 🗺️" button
3. See all your activities:
   - 🟢 Green marker = Start of journey
   - 🔵 Blue markers = Activities in between
   - 🔴 Red marker = End of journey
4. Click any marker to see activity details

**To add locations to activities:**
- When creating a note, scroll down to "Location" field
- Option 1: Type coordinates (e.g., `40.7128, -74.0060`)
- Option 2: Click "Current" button to auto-capture GPS coordinates

#### ✨ Feature 2: Daily AI Summary
**What it does:** Automatically summarizes what you did each day using Gemini AI

**How to use:**
1. Click 🗓️ Calendar icon
2. Select any date
3. Look at the **Activities** panel on right
4. You'll see a purple "Daily Summary" card with:
   - AI-generated summary of your day
   - Number of activities
   - Locations visited
   
**Example Summary:**
"On January 19, 2026, you had 3 memory notes and visited New York City, Times Square, and Central Park. You spent the day exploring Manhattan with several memorable moments."

### Part 4: API Endpoints Reference

**For Developers:**

```bash
# Timeline Map - Shows activities on map
GET /api/notes - Get all user's notes
GET /api/reminders - Get all user's reminders

# AI Summarization
POST /api/gemini-summarize
Body: {
  "activities": "formatted activities text",
  "date": "selected date string"
}
Response: { "summary": "AI generated summary text" }
```

### Part 5: Environment Variables Checklist

**Frontend (.env.local):**
```
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_key
```

**Backend (backend/.env):**
```
MONGODB_URI=mongodb://localhost:27017/memoaid
JWT_SECRET=memoaid_super_secret_key_change_in_production
PORT=5000
NODE_ENV=development
GOOGLE_API_KEY=AIzaSy...your_gemini_key
```

### Part 6: Troubleshooting

**"Google Maps API Key Required" Error:**
- Check `.env.local` file exists in project root
- Verify `VITE_GOOGLE_MAPS_API_KEY` is set correctly
- Restart frontend with `npm run dev`

**"Loading Google Maps..." stays forever:**
- Check browser console for errors (F12)
- Verify API key is valid and has Maps API enabled
- Check network tab to see if maps API is loading

**AI Summary not generating:**
- Verify `backend/.env` has `GOOGLE_API_KEY` set
- Restart backend server
- Check if backend is running on port 5000

**Location not capturing with "Current" button:**
- Check browser permission for geolocation
- Ensure you're on HTTPS or localhost
- Try manual coordinate entry instead

### Part 7: Sample Data for Testing

Try creating notes with these coordinates:
```
New York: 40.7128, -74.0060
San Francisco: 37.7749, -122.4194
Los Angeles: 34.0522, -118.2437
Chicago: 41.8781, -87.6298
```

### Part 8: Video Demo (Conceptual)
1. Create note with "Current Location" → Adds coordinates
2. Create another note in different location
3. Open Calendar → View Timeline
4. See map with 2 markers connected by line
5. See AI summary showing "You visited 2 locations today"

---

**Enjoy your memory timeline! 🚀**
