import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Initialize Gemini with API key
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('⚠️ GOOGLE_API_KEY is not set in environment variables');
}
const genAI = new GoogleGenerativeAI(apiKey);

router.post('/gemini-summarize', authenticateToken, async (req, res) => {
  try {
    const { activities, date } = req.body;

    if (!activities) {
      return res.status(400).json({ error: 'Activities text is required' });
    }

    if (!apiKey) {
      console.error('API Key not available');
      return res.status(500).json({ error: 'API configuration error' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are summarizing daily activities for a memory aid app for users who may have memory issues. Be concise, calm, and human.

Format your response EXACTLY like this:

# Daily Summary

[ONE simple opening sentence about the day]

## Memory Notes
- [Verb/noun start] [max 15 words]
- [Continue with max 2 more bullets if relevant]

## Reminders / Tasks
- [Verb/noun start] [max 15 words]
- [Continue with max 2 more bullets if relevant]

## Important Highlights
- [Verb/noun start] [max 15 words]

Closing: "You're all set for today. You can review or add more anytime."

RULES:
- NEVER repeat full note/reminder content
- Use short bullet points, start with verbs or clear nouns
- Focus on WHAT happened, not HOW
- Avoid technical or AI language
- If something is unclear, say so gently
- Only include sections that are relevant
- Each bullet is ONE line max
- Never exceed 15 words per bullet

Activities for ${date}:
${activities}`;

    console.log('Generating summary for:', date);
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    console.log('Summary generated successfully');
    res.json({ summary });
  } catch (error) {
    console.error('❌ Gemini summarization error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ error: 'Failed to generate summary', details: error.message });
  }
});

export default router;
