import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Medication Schema
const medicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    dosage: {
        type: String,
        default: '',
    },
    frequency: {
        type: String,
        default: '',
    },
    times: [{
        type: Number, // Timestamps for daily doses
    }],
    photoUrl: {
        type: String,
        default: '',
    },
    notes: {
        type: String,
        default: '',
    },
    refillDate: {
        type: Date,
    },
    enabled: {
        type: Boolean,
        default: true,
    },
    lastTaken: {
        type: Date,
    },
    takenHistory: [{
        timestamp: { type: Date },
        notes: { type: String }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Medication = mongoose.model('Medication', medicationSchema);

// Get all medications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const medications = await Medication.find({ userId: req.userId })
            .sort({ createdAt: -1 });
        res.json(medications);
    } catch (error) {
        console.error('Error fetching medications:', error);
        res.status(500).json({ error: 'Failed to fetch medications' });
    }
});

// Create medication
router.post('/', authenticateToken, async (req, res) => {
    try {
        const medication = new Medication({
            userId: req.userId,
            ...req.body,
        });
        await medication.save();
        res.status(201).json(medication);
    } catch (error) {
        console.error('Error creating medication:', error);
        res.status(500).json({ error: 'Failed to create medication' });
    }
});

// Update medication
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const medication = await Medication.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!medication) {
            return res.status(404).json({ error: 'Medication not found' });
        }
        res.json(medication);
    } catch (error) {
        console.error('Error updating medication:', error);
        res.status(500).json({ error: 'Failed to update medication' });
    }
});

// Delete medication
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const medication = await Medication.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });
        if (!medication) {
            return res.status(404).json({ error: 'Medication not found' });
        }
        res.json({ message: 'Medication deleted successfully' });
    } catch (error) {
        console.error('Error deleting medication:', error);
        res.status(500).json({ error: 'Failed to delete medication' });
    }
});

// Mark medication as taken
router.post('/:id/taken', authenticateToken, async (req, res) => {
    try {
        const { notes } = req.body;
        const medication = await Medication.findOne({
            _id: req.params.id,
            userId: req.userId,
        });

        if (!medication) {
            return res.status(404).json({ error: 'Medication not found' });
        }

        medication.lastTaken = new Date();
        medication.takenHistory.push({
            timestamp: new Date(),
            notes: notes || ''
        });
        medication.updatedAt = Date.now();

        await medication.save();
        res.json(medication);
    } catch (error) {
        console.error('Error marking medication as taken:', error);
        res.status(500).json({ error: 'Failed to mark medication as taken' });
    }
});

export default router;
