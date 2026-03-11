import mongoose from 'mongoose';

const personSchema = new mongoose.Schema({
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
  email: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  avatarType: {
    type: String,
    enum: ['image', 'video', 'audio', 'unknown'],
    default: 'image',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Person = mongoose.model('Person', personSchema);
