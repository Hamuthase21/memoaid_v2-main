import express from 'express';
import { Note } from '../models/Note.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all notes for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create note
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, location, mediaUrl, mediaData, type } = req.body;

    const note = new Note({
      userId: req.userId,
      title,
      content,
      tags: tags || [],
      location,
      mediaUrl,
      mediaData,
      type,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update note
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags, location, mediaUrl, mediaData, type } = req.body;

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, content, tags, location, mediaUrl, mediaData, type, updatedAt: Date.now() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete note
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
