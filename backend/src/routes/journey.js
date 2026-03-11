import express from 'express';
import { Journey } from '../models/Journey.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Save current location
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, accuracy } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    console.log('📍 [JOURNEY] Saving location - Lat:', latitude.toFixed(6), 'Lon:', longitude.toFixed(6), 'Accuracy:', accuracy.toFixed(0) + 'm');

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    const journey = new Journey({
      userId: req.userId,
      latitude,
      longitude,
      accuracy,
      date: dateStr,
      timestamp: now,
    });

    const saved = await journey.save();
    console.log('✅ [JOURNEY] Location saved successfully:', { lat: saved.latitude, lon: saved.longitude });
    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ [JOURNEY] Error saving journey:', error);
    res.status(500).json({ error: 'Failed to save location' });
  }
});

// TEST: Save a test location in India (for debugging)
router.post('/test/india', authenticateToken, async (req, res) => {
  try {
    console.log('🧪 [TEST] Saving test India location');
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    const journey = new Journey({
      userId: req.userId,
      latitude: 20.5937, // Center of India
      longitude: 78.9629,
      accuracy: 50,
      date: dateStr,
      timestamp: now,
    });

    const saved = await journey.save();
    console.log('✅ [TEST] Test location saved:', { lat: saved.latitude, lon: saved.longitude });
    res.status(201).json({ message: 'Test India location saved', location: saved });
  } catch (error) {
    console.error('❌ [TEST] Error saving test location:', error);
    res.status(500).json({ error: 'Failed to save test location' });
  }
});

// Get all journey points for today
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const journeys = await Journey.find({ userId: req.userId, date: today }).sort({ timestamp: 1 });
    res.json(journeys);
  } catch (error) {
    console.error('Error fetching today journeys:', error);
    res.status(500).json({ error: 'Failed to fetch journeys' });
  }
});

// Get journey points for a specific date
router.get('/date/:date', authenticateToken, async (req, res) => {
  try {
    const { date } = req.params; // Expected format: YYYY-MM-DD
    const journeys = await Journey.find({ userId: req.userId, date }).sort({ timestamp: 1 });
    res.json(journeys);
  } catch (error) {
    console.error('Error fetching journeys for date:', error);
    res.status(500).json({ error: 'Failed to fetch journeys' });
  }
});

// Get all journey points (paginated)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const journeys = await Journey.find({ userId: req.userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Journey.countDocuments({ userId: req.userId });

    res.json({
      journeys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching journeys:', error);
    res.status(500).json({ error: 'Failed to fetch journeys' });
  }
});

// Capture location via Google Maps Geolocation API (secure backend call)
router.post('/location/capture', async (req, res) => {
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      console.error('❌ GOOGLE_API_KEY not configured in .env');
      return res.status(500).json({ error: 'Location service not configured' });
    }

    console.log('📍 [LOCATION] Capturing location via Google Maps API');
    console.log('📍 [LOCATION] API Key:', GOOGLE_API_KEY.substring(0, 10) + '...');

    const response = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'MemoAid/1.0 (Server)',
        },
        body: JSON.stringify({
          considerIp: true,
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [LOCATION] Google API error: ${response.status}`);
      console.error(`❌ [LOCATION] Response: ${errorText}`);
      
      // If API key has restrictions, provide helpful error
      if (response.status === 403) {
        console.error('⚠️ [LOCATION] API Key has 403 error - likely API restrictions or quota issue');
        return res.status(403).json({ 
          error: 'Location service unavailable',
          status: 403,
          hint: 'Check Google Cloud Console - API key may have app restrictions or quota limit'
        });
      }
      
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.location) {
      console.warn('⚠️ [LOCATION] No location data returned from API');
      return res.status(400).json({ error: 'No location data available' });
    }

    const { lat, lng, accuracy } = data.location;

    console.log('✅ [LOCATION] Location captured:', { lat, lng, accuracy });

    res.json({ lat, lng, accuracy });
  } catch (error) {
    console.error('❌ [LOCATION] Error capturing location:', error.message);
    res.status(500).json({ error: 'Failed to capture location', details: error.message });
  }
});

export default router;
