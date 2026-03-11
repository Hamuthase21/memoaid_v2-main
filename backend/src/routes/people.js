import express from 'express';
import { authenticateToken } from './auth.js';
import { Person } from '../models/Person.js';

const router = express.Router();

// Get all people for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const people = await Person.find({ userId: req.userId });
    res.json(people);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch people' });
  }
});

// Create person
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, relationship, email, phone, notes, avatarUrl, avatarType } = req.body;

    const person = new Person({
      userId: req.userId,
      name,
      relationship,
      email,
      phone,
      notes,
      avatarUrl,
      avatarType,
    });

    await person.save();
    res.status(201).json(person);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create person' });
  }
});

// Update person
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, relationship, email, phone, notes, avatarUrl, avatarType } = req.body;

    const person = await Person.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, relationship, email, phone, notes, avatarUrl, avatarType, updatedAt: Date.now() },
      { new: true }
    );

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json(person);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update person' });
  }
});

// Delete person
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const person = await Person.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json({ message: 'Person deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete person' });
  }
});

export default router;
