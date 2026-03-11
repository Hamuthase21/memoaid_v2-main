import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true, // Index for fast lookup by user
    },
    eventType: {
      type: String,
      required: true,
      enum: ['note', 'reminder', 'routine', 'person', 'location', 'custom'],
    },
    eventData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      // Generic object - can contain any data relevant to eventType
    },
    startTime: {
      type: Number, // Unix timestamp in ms
      required: true,
      index: true, // Index for time-based queries
    },
    endTime: {
      type: Number, // Unix timestamp in ms, optional
      default: null,
    },
    dayKey: {
      type: String, // YYYY-MM-DD format, derived from startTime
      required: true,
      index: true, // Compound index with userId for fast day lookups
    },
    tags: {
      type: [String],
      default: [],
      // Optional tags for categorization (e.g., 'important', 'health', 'memory')
    },
    isImportant: {
      type: Boolean,
      default: false,
      // Flag to mark major events for summary highlighting
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt
    collection: 'timelines',
  }
);

// Compound index: userId + dayKey for efficient day queries
timelineSchema.index({ userId: 1, dayKey: 1 });

// Compound index: userId + startTime for time-range queries
timelineSchema.index({ userId: 1, startTime: 1 });

// Ensure events are immutable (no updates after creation)
// This is enforced at the API level, not schema level
timelineSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    const err = new Error('Timeline events are immutable. Cannot modify existing events.');
    next(err);
  } else {
    next();
  }
});

export default mongoose.model('Timeline', timelineSchema);
