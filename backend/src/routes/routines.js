import express from 'express';
import mongoose from 'mongoose';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Routine schema matching frontend expectations
const routineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  repeat: {
    type: String,
    enum: ['daily', 'none'],
    default: 'daily',
  },
  voiceMode: {
    type: String,
    enum: ['speech', 'person', 'custom'],
    default: 'speech',
  },
  voicePersonId: {
    type: String,
    default: '',
  },
  voiceUrl: {
    type: String,
    default: '',
  },
  tasks: [{
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  }],
  completionHistory: [{
    date: { type: Date },
    completedTasks: { type: Number },
    totalTasks: { type: Number }
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

const Routine = mongoose.model('Routine', routineSchema);

// Get all routines for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const routines = await Routine.find({ userId: req.userId });
    res.json(routines);
  } catch (error) {
    console.error('Error fetching routines:', error);
    res.status(500).json({ error: 'Failed to fetch routines' });
  }
});

// Create routine
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, time, enabled, repeat, voiceMode, voicePersonId, voiceUrl } = req.body;

    if (!title || time === undefined) {
      return res.status(400).json({ error: 'Title and time are required' });
    }

    const routine = new Routine({
      userId: req.userId,
      title,
      time,
      enabled: enabled !== false,
      repeat: repeat || 'daily',
      voiceMode: voiceMode || 'speech',
      voicePersonId: voicePersonId || '',
      voiceUrl: voiceUrl || '',
    });

    await routine.save();
    res.status(201).json(routine);
  } catch (error) {
    console.error('Error creating routine:', error);
    res.status(500).json({ error: 'Failed to create routine', details: error.message });
  }
});

// Update routine
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, time, enabled, repeat, voiceMode, voicePersonId, voiceUrl } = req.body;

    const routine = await Routine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        title: title || undefined,
        time: time !== undefined ? time : undefined,
        enabled: enabled !== undefined ? enabled : undefined,
        repeat: repeat || undefined,
        voiceMode: voiceMode || undefined,
        voicePersonId: voicePersonId || undefined,
        voiceUrl: voiceUrl || undefined,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    res.json(routine);
  } catch (error) {
    console.error('Error updating routine:', error);
    res.status(500).json({ error: 'Failed to update routine', details: error.message });
  }
});

// Delete routine
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const routine = await Routine.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    res.json({ message: 'Routine deleted' });
  } catch (error) {
    console.error('Error deleting routine:', error);
    res.status(500).json({ error: 'Failed to delete routine' });
  }
});

// Mark task as complete
router.put('/:id/tasks/:taskIndex/complete', authenticateToken, async (req, res) => {
  try {
    const { id, taskIndex } = req.params;
    const { completed } = req.body;

    const routine = await Routine.findOne({ _id: id, userId: req.userId });

    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    if (!routine.tasks || taskIndex >= routine.tasks.length) {
      return res.status(404).json({ error: 'Task not found' });
    }

    routine.tasks[taskIndex].completed = completed;
    routine.tasks[taskIndex].completedAt = completed ? new Date() : null;
    routine.updatedAt = Date.now();

    // Update completion history for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedCount = routine.tasks.filter(t => t.completed).length;
    const totalCount = routine.tasks.length;

    const historyIndex = routine.completionHistory.findIndex(h => {
      const hDate = new Date(h.date);
      hDate.setHours(0, 0, 0, 0);
      return hDate.getTime() === today.getTime();
    });

    if (historyIndex >= 0) {
      routine.completionHistory[historyIndex].completedTasks = completedCount;
      routine.completionHistory[historyIndex].totalTasks = totalCount;
    } else {
      routine.completionHistory.push({
        date: today,
        completedTasks: completedCount,
        totalTasks: totalCount
      });
    }

    await routine.save();
    res.json(routine);
  } catch (error) {
    console.error('Error updating task completion:', error);
    res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
});

// Get completion statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const routines = await Routine.find({ userId: req.userId });

    const stats = {
      totalRoutines: routines.length,
      routinesWithTasks: routines.filter(r => r.tasks && r.tasks.length > 0).length,
      totalTasks: routines.reduce((sum, r) => sum + (r.tasks?.length || 0), 0),
      completedToday: 0,
      completionRate: 0,
      streak: 0,
      history: []
    };

    // Calculate today's completion
    routines.forEach(routine => {
      if (routine.tasks && routine.tasks.length > 0) {
        const completedCount = routine.tasks.filter(t => t.completed).length;
        stats.completedToday += completedCount;
      }
    });

    if (stats.totalTasks > 0) {
      stats.completionRate = Math.round((stats.completedToday / stats.totalTasks) * 100);
    }

    // Calculate streak (consecutive days with 100% completion)
    const allHistory = [];
    routines.forEach(routine => {
      if (routine.completionHistory) {
        routine.completionHistory.forEach(h => {
          const dateStr = new Date(h.date).toDateString();
          const existing = allHistory.find(ah => new Date(ah.date).toDateString() === dateStr);
          if (existing) {
            existing.completedTasks += h.completedTasks;
            existing.totalTasks += h.totalTasks;
          } else {
            allHistory.push({ ...h });
          }
        });
      }
    });

    allHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    for (const h of allHistory) {
      if (h.completedTasks === h.totalTasks && h.totalTasks > 0) {
        streak++;
      } else {
        break;
      }
    }
    stats.streak = streak;
    stats.history = allHistory.slice(0, 30); // Last 30 days

    res.json(stats);
  } catch (error) {
    console.error('Error fetching routine stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
  }
});

export default router;
