import express from 'express';
import { Reminder } from '../models/Reminder.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all reminders for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.userId });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Create reminder
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    const reminder = new Reminder({
      userId: req.userId,
      title,
      description,
      dueDate,
    });

    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Update reminder
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, dueDate, completed } = req.body;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, description, dueDate, completed, updatedAt: Date.now() },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Delete reminder
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

export default router;
