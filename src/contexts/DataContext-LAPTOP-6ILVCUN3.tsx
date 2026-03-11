import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note, Reminder, HealingContent, Routine } from '../types';
import { api } from '../api';
import { useAuth } from './AuthContext';

interface DataContextType {
  notes: Note[];
  reminders: Reminder[];
  healingContent: HealingContent[];
  people: { id: string; name: string; relation?: string; avatarUrl?: string; avatarType?: 'image' | 'video' | 'audio' | 'unknown'; phone?: string }[];
  routines: Routine[];
  addNote: (note: Omit<Note, 'id' | 'timestamp'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addPerson: (p: { name: string; relation?: string; avatarUrl?: string; avatarType?: 'image' | 'video' | 'audio' | 'unknown'; phone?: string }) => void;
  updatePerson: (id: string, updates: Partial<{ name: string; relation?: string; avatarUrl?: string; avatarType?: 'image' | 'video' | 'audio' | 'unknown'; phone?: string }>) => void;
  deletePerson: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  addRoutine: (r: Omit<Routine, 'id'>) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  playVoice: (url: string, loop?: boolean) => void;
  playTTS: (text: string, intervalMs?: number) => void;
  stopVoice: () => void;
  searchNotes: (query: string) => Note[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

const sampleHealingContent: HealingContent[] = [
  {
    id: '1',
    category: 'tip',
    title: 'Create a Memory Journal',
    content: 'Write down important events, thoughts, and feelings each day. This helps reinforce memories and provides a reference you can return to.',
    difficulty: 'easy',
  },
  {
    id: '2',
    category: 'tip',
    title: 'Use Visual Cues',
    content: 'Place photos, labels, and signs around your home to help you remember important information and where things are located.',
    difficulty: 'easy',
  },
  {
    id: '3',
    category: 'exercise',
    title: 'Word Association Game',
    content: 'Think of a word, then try to name 5 related words. For example: "Ocean" → wave, fish, blue, sand, swim. This exercise strengthens memory connections.',
    difficulty: 'easy',
  },
  {
    id: '4',
    category: 'game',
    title: 'Name That Tune',
    content: 'Listen to familiar songs and try to name the title and artist. Music is strongly tied to memory and can help trigger other recollections.',
    difficulty: 'easy',
  },
  {
    id: '5',
    category: 'meditation',
    title: 'Breathing Focus Exercise',
    content: 'Sit comfortably and focus on your breath. Count each inhale and exhale up to 10, then start over. This calms the mind and improves focus.',
    difficulty: 'easy',
  },
];

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [people, setPeople] = useState<{ id: string; name: string; relation?: string; avatarUrl?: string; avatarType?: 'image' | 'video' | 'audio' | 'unknown' }[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  
  // single media player to control looping voice playback (persist across renders)
  const currentAudioRef = { current: null as HTMLAudioElement | null } as { current: HTMLAudioElement | null };
  const ttsIntervalRef = { current: null as number | null } as { current: number | null };

  const playVoice = (url: string, loop = true) => {
    try {
      // stop existing
      if (currentAudioRef.current) {
        try { currentAudioRef.current.pause(); currentAudioRef.current.currentTime = 0; } catch {};
        currentAudioRef.current = null;
      }
      const a = new Audio(url);
      a.loop = loop;
      a.play().catch(() => {});
      currentAudioRef.current = a;
    } catch (e) {
      console.error('playVoice error', e);
    }
  };

  const playTTS = (text: string, intervalMs = 8000) => {
    try {
      // stop any existing audio/tts
      stopVoice();
      if ('speechSynthesis' in window) {
        const speak = () => {
          const utter = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(utter);
        };
        speak();
        const id = window.setInterval(speak, intervalMs) as unknown as number;
        ttsIntervalRef.current = id;
      }
    } catch (e) {
      console.error('playTTS error', e);
    }
  };

  const stopVoice = () => {
    try {
      if (currentAudioRef.current) {
        try { currentAudioRef.current.pause(); currentAudioRef.current.currentTime = 0; } catch {}
        currentAudioRef.current = null;
      }
      if (ttsIntervalRef.current) {
        try { window.clearInterval(ttsIntervalRef.current); } catch {};
        ttsIntervalRef.current = null;
      }
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch (e) {
      console.error('stopVoice error', e);
    }
  };
  const [healingContent] = useState<HealingContent[]>(sampleHealingContent);
  const { user } = useAuth();

  useEffect(() => {
    const loadLocal = () => {
      const storedNotes = localStorage.getItem('memoaid_notes');
      const storedReminders = localStorage.getItem('memoaid_reminders');
      const storedPeople = localStorage.getItem('memoaid_people');
        const storedRoutines = localStorage.getItem('memoaid_routines');
      try {
        if (storedNotes) {
          const parsed = JSON.parse(storedNotes);
          setNotes(Array.isArray(parsed) ? parsed : [parsed]);
        }
      } catch {}
      try {
        if (storedReminders) {
          const parsed = JSON.parse(storedReminders);
          setReminders(Array.isArray(parsed) ? parsed : [parsed]);
        }
      } catch {}
      try {
        if (storedPeople) {
          const parsed = JSON.parse(storedPeople);
          setPeople(Array.isArray(parsed) ? parsed : [parsed]);
        }
      } catch {}
      try {
        if (storedRoutines) {
          const parsed = JSON.parse(storedRoutines);
          setRoutines(Array.isArray(parsed) ? parsed : [parsed]);
        }
      } catch {}
    };

    // Always load local first so UI can show immediately
    loadLocal();

    if (user) {
      (async () => {
        try {
          // helper to merge arrays by id (remote wins)
          const mergeById = <T extends { id: string }>(remote: T[], local: T[]) => {
            const m = new Map<string, T>();
            // add local first
            for (const it of local || []) m.set(it.id, it);
            // override with remote
            for (const it of remote || []) m.set(it.id, it);
            return Array.from(m.values());
          };

          // Notes
          const n = await api.notes.getAll();
          setNotes((prevLocal) => {
            const merged = mergeById(n, prevLocal || []);
            return merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          });

          // Reminders
          const r = await api.reminders.getAll();
          setReminders((prevLocal) => mergeById(r, prevLocal || []));

          // People
          try {
            const p = await api.people.getAll();
            setPeople((prevLocal) => mergeById(p, prevLocal || []));
          } catch (pe) {
            // keep local if fetch fails (already loaded)
          }

          // Routines
          try {
            const rs = await api.routines.getAll();
            setRoutines((prevLocal) => mergeById(rs, prevLocal || []));
          } catch (re) {
            // keep local if fetch fails
          }
        } catch (e) {
          // If main fetch fails, we already loaded local values; nothing more to do
        }
      })();
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('memoaid_notes', JSON.stringify(notes));
    // Remove the problematic sync logic that was causing notes to disappear
    // Notes are now synced only when added/updated/deleted individually
  }, [notes]);

  // Simple reminder checker (runs every 30s) to trigger notifications for pending reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      reminders.forEach((r) => {
        if (r.status === 'pending' && r.reminderTime <= now) {
          // trigger notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('MemoAid Reminder', { body: `Reminder for note ${r.noteId}` });
          }
          // Play voice if configured: person media preferred, otherwise use TTS
          const person = r.voicePersonId ? people.find(p => p.id === r.voicePersonId) : null;
          if ((r as any).voice && person) {
            if (person.avatarUrl && (person.avatarType === 'audio' || person.avatarType === 'video')) {
              playVoice(person.avatarUrl as string, true);
            } else {
              // speak repeatedly until stopped
              playTTS(`Reminder: ${r.noteId}`);
            }
          } else if ((r as any).voice) {
            // voice set but no person, use TTS loop
            playTTS(`Reminder for note ${r.noteId}`);
          }
          // Update reminder status or reschedule if repeating
          if ((r as any).repeat === 'daily') {
            updateReminder(r.id, { reminderTime: r.reminderTime + 24 * 60 * 60 * 1000 });
          } else {
            updateReminder(r.id, { status: 'sent' });
          }
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [reminders]);

  // Routine scheduler: check every 30s, speak the routine and reschedule daily if enabled
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      routines.forEach((rt) => {
        if (rt.enabled && rt.time <= now) {
          // Play voice: if person media exists use it, otherwise TTS
          const person = rt.voiceMode === 'person' && rt.voicePersonId ? people.find(p => p.id === rt.voicePersonId) : null;
          if (person && person.avatarUrl && (person.avatarType === 'audio' || person.avatarType === 'video')) {
            playVoice(person.avatarUrl as string, true);
          } else if (rt.voiceMode === 'speech' || !rt.voiceMode) {
            const personName = rt.personId ? (people.find(p => p.id === rt.personId)?.name || '') : '';
            const utterText = `${rt.title}${personName ? ' for ' + personName : ''}`;
            // speak repeatedly until stopped
            playTTS(utterText);
          } else if (rt.voiceMode === 'custom' && rt.voiceUrl) {
            playVoice(rt.voiceUrl as string, true);
          }
          if (rt.repeat === 'daily') {
            updateRoutine(rt.id, { time: rt.time + 24 * 60 * 60 * 1000 });
          } else {
            updateRoutine(rt.id, { enabled: false });
          }
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [routines, people]);

  const addNote = async (note: Omit<Note, 'id' | 'timestamp'>) => {
    const newNote = { ...note, id: Date.now().toString(), timestamp: Date.now() };
    setNotes((prev) => [newNote, ...prev]);
    if (user) {
      try {
        await api.notes.create(newNote);
      } catch (e) {
        console.error('API add note error:', e);
      }
    }
  };

  const addPerson = async (p: { name: string; relation?: string; avatarUrl?: string; avatarType?: 'image' | 'video' | 'audio' | 'unknown'; phone?: string }) => {
    const newPerson = { ...p, id: Date.now().toString() };
    setPeople((prev) => [newPerson, ...prev]);
    if (user) {
      try {
        await api.people.create(newPerson);
      } catch (e) {
        console.error('API add person error:', e);
      }
    }
  };

  const updatePerson = async (id: string, updates: Partial<{ name: string; relation?: string; avatarUrl?: string; avatarType?: 'image' | 'video' | 'audio' | 'unknown'; phone?: string }>) => {
    setPeople((prev) => prev.map((pp) => (pp.id === id ? { ...pp, ...updates } : pp)));
    if (user) {
      try {
        await api.people.update(id, updates);
      } catch (e) {
        console.error('API update person error:', e);
      }
    }
  };

  const deletePerson = async (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));
    if (user) {
      try {
        await api.people.delete(id);
      } catch (e) {
        console.error('API delete person error:', e);
      }
    }
  };

  const addRoutine = async (r: Omit<Routine, 'id'>) => {
    const newR: Routine = { ...r, id: Date.now().toString() };
    setRoutines((prev) => [newR, ...prev]);
    if (user) {
      try {
        await api.routines.create(newR);
      } catch (e) {
        console.error('API add routine error:', e);
      }
    }
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    setRoutines((prev) => prev.map((rt) => (rt.id === id ? { ...rt, ...updates } : rt)));
    if (user) {
      try {
        await api.routines.update(id, updates);
      } catch (e) {
        console.error('API update routine error:', e);
      }
    }
  };

  const deleteRoutine = async (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    if (user) {
      try {
        await api.routines.delete(id);
      } catch (e) {
        console.error('API delete routine error:', e);
      }
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...updates } : note))
    );
    if (user) {
      try {
        await api.notes.update(id, updates);
      } catch (e) {
        console.error('API update note error:', e);
      }
    }
  };

  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
    setReminders((prev) => prev.filter((reminder) => reminder.noteId !== id));
    if (user) {
      try {
        await api.notes.delete(id);
        // Also delete related reminders
        const relatedReminders = reminders.filter(r => r.noteId === id);
        for (const rem of relatedReminders) {
          await api.reminders.delete(rem.id);
        }
      } catch (e) {
        console.error('API delete note error:', e);
      }
    }
  };

  const addReminder = async (reminder: Omit<Reminder, 'id'>) => {
    const newReminder: Reminder = {
      ...reminder,
      id: Date.now().toString(),
    };
    setReminders((prev) => [...prev, newReminder]);
    if (user) {
      try {
        await api.reminders.create(newReminder);
      } catch (e) {
        console.error('API add reminder error:', e);
      }
    }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    setReminders((prev) =>
      prev.map((reminder) => (reminder.id === id ? { ...reminder, ...updates } : reminder))
    );
    if (user) {
      try {
        await api.reminders.update(id, updates);
      } catch (e) {
        console.error('API update reminder error:', e);
      }
    }
  };

  const deleteReminder = async (id: string) => {
    setReminders((prev) => prev.filter((reminder) => reminder.id !== id));
    if (user) {
      try {
        await api.reminders.delete(id);
      } catch (e) {
        console.error('API delete reminder error:', e);
      }
    }
  };

  const searchNotes = (query: string): Note[] => {
    const lowerQuery = query.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content?.toLowerCase().includes(lowerQuery) ||
        note.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  };

  return (
    <DataContext.Provider
      value={{
        notes,
        reminders,
        healingContent,
        people,
        routines,
        addNote,
        updateNote,
        deleteNote,
        addPerson,
        updatePerson,
        deletePerson,
        addReminder,
        updateReminder,
        deleteReminder,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        playVoice,
        playTTS,
        stopVoice,
        searchNotes,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
