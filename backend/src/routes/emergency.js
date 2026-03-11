import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Emergency Contact Schema
const emergencyContactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    relationship: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['family', 'doctor', 'emergency_service', 'other'],
        default: 'family',
    },
    priority: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const EmergencyContact = mongoose.model('EmergencyContact', emergencyContactSchema);

// Medical Info Schema
const medicalInfoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    bloodType: {
        type: String,
        default: '',
    },
    allergies: [{
        type: String,
    }],
    conditions: [{
        type: String,
    }],
    medications: [{
        type: String,
    }],
    emergencyNotes: {
        type: String,
        default: '',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const MedicalInfo = mongoose.model('MedicalInfo', medicalInfoSchema);

// ===== Emergency Contacts Routes =====

// Get all emergency contacts
router.get('/contacts', authenticateToken, async (req, res) => {
    try {
        const contacts = await EmergencyContact.find({ userId: req.userId })
            .sort({ priority: -1, createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching emergency contacts:', error);
        res.status(500).json({ error: 'Failed to fetch emergency contacts' });
    }
});

// Create emergency contact
router.post('/contacts', authenticateToken, async (req, res) => {
    try {
        const contact = new EmergencyContact({
            userId: req.userId,
            ...req.body,
        });
        await contact.save();
        res.status(201).json(contact);
    } catch (error) {
        console.error('Error creating emergency contact:', error);
        res.status(500).json({ error: 'Failed to create emergency contact' });
    }
});

// Update emergency contact
router.put('/contacts/:id', authenticateToken, async (req, res) => {
    try {
        const contact = await EmergencyContact.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json(contact);
    } catch (error) {
        console.error('Error updating emergency contact:', error);
        res.status(500).json({ error: 'Failed to update emergency contact' });
    }
});

// Delete emergency contact
router.delete('/contacts/:id', authenticateToken, async (req, res) => {
    try {
        const contact = await EmergencyContact.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId,
        });
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting emergency contact:', error);
        res.status(500).json({ error: 'Failed to delete emergency contact' });
    }
});

// ===== Medical Info Routes =====

// Get medical info
router.get('/medical-info', authenticateToken, async (req, res) => {
    try {
        let medicalInfo = await MedicalInfo.findOne({ userId: req.userId });
        if (!medicalInfo) {
            // Create default medical info if doesn't exist
            medicalInfo = new MedicalInfo({ userId: req.userId });
            await medicalInfo.save();
        }
        res.json(medicalInfo);
    } catch (error) {
        console.error('Error fetching medical info:', error);
        res.status(500).json({ error: 'Failed to fetch medical info' });
    }
});

// Update medical info
router.put('/medical-info', authenticateToken, async (req, res) => {
    try {
        let medicalInfo = await MedicalInfo.findOne({ userId: req.userId });
        if (!medicalInfo) {
            medicalInfo = new MedicalInfo({
                userId: req.userId,
                ...req.body,
            });
        } else {
            Object.assign(medicalInfo, req.body);
            medicalInfo.updatedAt = Date.now();
        }
        await medicalInfo.save();
        res.json(medicalInfo);
    } catch (error) {
        console.error('Error updating medical info:', error);
        res.status(500).json({ error: 'Failed to update medical info' });
    }
});

export default router;
