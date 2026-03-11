import mongoose from 'mongoose';

const journeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  accuracy: Number,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  date: {
    type: String, // YYYY-MM-DD format for daily grouping
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export const Journey = mongoose.model('Journey', journeySchema);
