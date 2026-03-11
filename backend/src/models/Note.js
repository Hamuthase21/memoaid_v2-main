import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  tags: [String],
  location: {
    type: String,
    default: '',
  },
  mediaUrl: {
    type: String,
    default: '',
  },
  mediaData: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['text', 'audio', 'image', 'video'],
    default: 'text',
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

export const Note = mongoose.model('Note', noteSchema);
