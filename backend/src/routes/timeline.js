import express from 'express';
import Timeline from '../models/Timeline.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

/**
 * Utility: Derive dayKey from timestamp
 * dayKey format: YYYY-MM-DD
 */
const getDayKeyFromTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * POST /timeline/event
 * Create a new timeline event with automatic timestamp assignment
 * 
 * Body: {
 *   eventType: string (enum: 'note', 'reminder', 'routine', 'person', 'location', 'custom'),
 *   eventData: object (generic event data),
 *   startTime?: number (optional, defaults to Date.now()),
 *   endTime?: number (optional),
 *   tags?: string[] (optional),
 *   isImportant?: boolean (optional, default false)
 * }
 */
router.post('/event', authenticateToken, async (req, res) => {
  try {
    const { eventType, eventData, startTime, endTime, tags = [], isImportant = false } = req.body;

    // Validation
    if (!eventType) {
      return res.status(400).json({ error: 'eventType is required' });
    }
    if (!eventData) {
      return res.status(400).json({ error: 'eventData is required' });
    }

    const validEventTypes = ['note', 'reminder', 'routine', 'person', 'location', 'custom'];
    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        error: `Invalid eventType. Must be one of: ${validEventTypes.join(', ')}`,
      });
    }

    // Auto-assign timestamp if not provided
    const timestamp = startTime || Date.now();

    // Derive dayKey
    const dayKey = getDayKeyFromTimestamp(timestamp);

    // Create timeline event
    const event = new Timeline({
      userId: req.userId,
      eventType,
      eventData,
      startTime: timestamp,
      endTime: endTime || null,
      dayKey,
      tags,
      isImportant,
    });

    await event.save();

    console.log(`✅ Timeline event created: ${eventType} on ${dayKey}`);
    res.status(201).json({
      success: true,
      event: {
        id: event._id,
        eventType: event.eventType,
        startTime: event.startTime,
        dayKey: event.dayKey,
      },
    });
  } catch (error) {
    console.error('❌ Timeline event creation error:', error.message);
    res.status(500).json({ error: 'Failed to create timeline event', details: error.message });
  }
});

/**
 * GET /timeline/day?date=YYYY-MM-DD
 * Fetch all events for a specific day, strictly ordered by startTime (ascending)
 * 
 * Response: {
 *   date: string,
 *   eventCount: number,
 *   events: [
 *     {
 *       id: string,
 *       time: "HH:MM AM/PM",
 *       eventType: string,
 *       eventData: object,
 *       startTime: number,
 *       endTime?: number,
 *       isImportant: boolean,
 *       tags: string[]
 *     }
 *   ]
 * }
 */
router.get('/day', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;

    // Validation
    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required (format: YYYY-MM-DD)' });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Must be YYYY-MM-DD' });
    }

    // Fetch all events for the day, strictly ordered by startTime
    const events = await Timeline.find({
      userId: req.userId,
      dayKey: date,
    }).sort({ startTime: 1 }); // Ascending order (earliest first)

    // Format events for response
    const formattedEvents = events.map((event) => {
      const timeStr = new Date(event.startTime).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        id: event._id,
        time: timeStr,
        eventType: event.eventType,
        eventData: event.eventData,
        startTime: event.startTime,
        endTime: event.endTime || null,
        isImportant: event.isImportant,
        tags: event.tags,
      };
    });

    console.log(`📅 Fetched ${formattedEvents.length} events for ${date}`);
    res.json({
      success: true,
      date,
      eventCount: formattedEvents.length,
      events: formattedEvents,
    });
  } catch (error) {
    console.error('❌ Timeline fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch timeline', details: error.message });
  }
});

/**
 * GET /timeline/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Fetch events across a date range
 */
router.get('/range', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate query parameters are required' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ error: 'Invalid date format. Must be YYYY-MM-DD' });
    }

    // Fetch all events in the range
    const events = await Timeline.find({
      userId: req.userId,
      dayKey: { $gte: startDate, $lte: endDate },
    }).sort({ startTime: 1 });

    // Group by dayKey
    const byDay = {};
    events.forEach((event) => {
      if (!byDay[event.dayKey]) {
        byDay[event.dayKey] = [];
      }
      byDay[event.dayKey].push({
        id: event._id,
        time: new Date(event.startTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        eventType: event.eventType,
        eventData: event.eventData,
        startTime: event.startTime,
        endTime: event.endTime || null,
        isImportant: event.isImportant,
        tags: event.tags,
      });
    });

    console.log(`📅 Fetched ${events.length} events from ${startDate} to ${endDate}`);
    res.json({
      success: true,
      startDate,
      endDate,
      eventCount: events.length,
      byDay,
    });
  } catch (error) {
    console.error('❌ Timeline range fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch timeline range', details: error.message });
  }
});

/**
 * GET /timeline/summary?date=YYYY-MM-DD
 * Get a daily summary (first/last events, event count, important events)
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date query parameter is required (format: YYYY-MM-DD)' });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Must be YYYY-MM-DD' });
    }

    // Fetch all events for the day
    const events = await Timeline.find({
      userId: req.userId,
      dayKey: date,
    }).sort({ startTime: 1 });

    if (events.length === 0) {
      return res.json({
        success: true,
        date,
        summary: 'No events recorded for this day.',
        eventCount: 0,
        firstEvent: null,
        lastEvent: null,
        importantEventCount: 0,
      });
    }

    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    const importantEvents = events.filter((e) => e.isImportant);

    const firstTime = new Date(firstEvent.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    const lastTime = new Date(lastEvent.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const summaryText =
      events.length === 1
        ? `You had 1 event on ${date} at ${firstTime}.`
        : `You had ${events.length} events on ${date}, starting at ${firstTime} and ending at ${lastTime}.`;

    res.json({
      success: true,
      date,
      summary: summaryText,
      eventCount: events.length,
      firstEvent: {
        time: firstTime,
        type: firstEvent.eventType,
      },
      lastEvent: {
        time: lastTime,
        type: lastEvent.eventType,
      },
      importantEventCount: importantEvents.length,
    });
  } catch (error) {
    console.error('❌ Timeline summary error:', error.message);
    res.status(500).json({ error: 'Failed to fetch timeline summary', details: error.message });
  }
});

export default router;
