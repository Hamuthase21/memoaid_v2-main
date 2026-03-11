import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note, Reminder, HealingContent, Routine } from '../types';
import { api } from '../api';
import { useAuth } from './AuthContext';
import { saveMediaToIndexedDB, getMediaFromIndexedDB, deleteMediaFromIndexedDB } from '../utils/indexedDBUtils';

interface DataContextType {
  notes: Note[];
  reminders: Reminder[];
  healingContent: HealingContent[];
  people: { id: string; name: string; relation?: string; avatarUrl?: string; avatarType?: 'image' | 'video' | 'audio' | 'unknown'; phone?: string }[];
  routines: Routine[];
  activeAlarm: { routineId: string; taskName: string } | null;
  dismissAlarm: (routineId: string) => void;
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
  const [people, setPeople] = useState<{ id: string; name: string; relation?: string; avatarUrl?: string; avatarType?: 'image' | 'video' | 'audio' | 'unknown'; phone?: string }[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeAlarm, setActiveAlarm] = useState<{ routineId: string; taskName: string } | null>(null);
  const [dismissedRoutinesThisRun, setDismissedRoutinesThisRun] = useState<Set<string>>(new Set());
  const triggeredRoutinesRef = { current: new Set<string>() } as { current: Set<string> };

  // single media player to control looping voice playback (persist across renders)
  const currentAudioRef = { current: null as HTMLAudioElement | null } as { current: HTMLAudioElement | null };
  const ttsIntervalRef = { current: null as number | null } as { current: number | null };
  const alarmAudioRef = { current: null as HTMLAudioElement | null } as { current: HTMLAudioElement | null };

  const playVoice = (url: string, loop = true) => {
    try {
      // stop existing
      if (currentAudioRef.current) {
        try { currentAudioRef.current.pause(); currentAudioRef.current.currentTime = 0; } catch { };
        currentAudioRef.current = null;
      }
      const a = new Audio(url);
      a.loop = loop;
      a.play().catch(() => { });
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
        try { currentAudioRef.current.pause(); currentAudioRef.current.currentTime = 0; } catch { }
        currentAudioRef.current = null;
      }
      if (alarmAudioRef.current) {
        try { alarmAudioRef.current.pause(); alarmAudioRef.current.currentTime = 0; } catch { }
        alarmAudioRef.current = null;
      }
      if (ttsIntervalRef.current) {
        try { window.clearInterval(ttsIntervalRef.current); } catch { };
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
      // Helper to sanitize blob URLs from stored data
      const sanitizeMediaData = (data: any) => {
        if (!data) return data;
        if (Array.isArray(data)) {
          return data.map(item => {
            if (item.mediaData && item.mediaData.startsWith('blob:')) {
              return { ...item, mediaData: '' };
            }
            return item;
          });
        }
        return data;
      };

      const storedNotes = localStorage.getItem('memoaid_notes');
      const storedReminders = localStorage.getItem('memoaid_reminders');
      const storedPeople = localStorage.getItem('memoaid_people');
      const storedRoutines = localStorage.getItem('memoaid_routines');
      try {
        if (storedNotes) {
          const parsed = JSON.parse(storedNotes);
          const sanitized = sanitizeMediaData(Array.isArray(parsed) ? parsed : [parsed]);
          setNotes(sanitized);
        }
      } catch { }
      try {
        if (storedReminders) {
          const parsed = JSON.parse(storedReminders);
          setReminders(Array.isArray(parsed) ? parsed : [parsed]);
        }
      } catch { }
      try {
        if (storedPeople) {
          const parsed = JSON.parse(storedPeople);
          const peopleArray = Array.isArray(parsed) ? parsed : [parsed];
          setPeople(peopleArray);

          // Load avatars from IndexedDB for all people
          Promise.all(
            peopleArray.map(async (person: any) => {
              const avatarFromDB = await getMediaFromIndexedDB(person.id);
              if (avatarFromDB) {
                return { ...person, avatarUrl: avatarFromDB };
              }
              return person;
            })
          ).then((peopleWithAvatars) => {
            setPeople(peopleWithAvatars);
          }).catch((error) => {
            console.error('Failed to load avatars from IndexedDB:', error);
          });
        }
      } catch { }
      try {
        if (storedRoutines) {
          const parsed = JSON.parse(storedRoutines);
          setRoutines(Array.isArray(parsed) ? parsed : [parsed]);
          // Clear dismissed routines on app load to allow re-triggering
          setDismissedRoutinesThisRun(new Set());
        }
      } catch { }
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
          const transformedNotes = (n || []).map((note: any) => ({
            ...note,
            id: note._id || note.id,
            timestamp: new Date(note.createdAt).getTime(),
          }));
          setNotes((prevLocal) => {
            const merged = mergeById(transformedNotes, prevLocal || []);
            return merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          });

          // Reminders
          const r = await api.reminders.getAll();
          setReminders((prevLocal) => mergeById(r, prevLocal || []));

          // People
          try {
            const p = await api.people.getAll();
            const transformedPeople = (p || []).map((person: any) => ({
              ...person,
              id: person._id || person.id,
              relation: person.relationship || '',
            }));
            setPeople((prevLocal) => mergeById(transformedPeople, prevLocal || []));

            // Load avatars from IndexedDB for all people
            const peopleWithAvatars = await Promise.all(
              transformedPeople.map(async (person: any) => {
                const avatarFromDB = await getMediaFromIndexedDB(person.id);
                if (avatarFromDB) {
                  return { ...person, avatarUrl: avatarFromDB };
                }
                return person;
              })
            );
            setPeople((prevLocal) => mergeById(peopleWithAvatars, prevLocal || []));
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

    // Start automatic location tracking using browser's native Geolocation API
    if (user && 'geolocation' in navigator) {
      let lastSavedLocation: { lat: number; lon: number; timestamp: number } | null = null;
      const MOVEMENT_THRESHOLD_KM = 0.1; // Only save if moved >100m

      const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
      ): number => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const captureLocationViaBrowser = (position: GeolocationPosition) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          const now = Date.now();

          // Check if this is significant movement or first capture
          if (lastSavedLocation) {
            const distance = calculateDistance(
              lastSavedLocation.lat,
              lastSavedLocation.lon,
              latitude,
              longitude
            );

            console.log(
              `📍 Distance from last: ${(distance * 1000).toFixed(0)}m (threshold: 100m), Accuracy: ±${accuracy.toFixed(0)}m`
            );
            console.log(`   Current: (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`);
            console.log(`   Last saved: (${lastSavedLocation.lat.toFixed(6)}, ${lastSavedLocation.lon.toFixed(6)})`);

            // Only save if moved more than threshold or 5 minutes passed
            if (
              distance < MOVEMENT_THRESHOLD_KM &&
              now - lastSavedLocation.timestamp < 5 * 60 * 1000
            ) {
              console.log(
                `⏭️  Minor movement detected (${(distance * 1000).toFixed(0)}m) - skipping save`
              );
              return;
            }
          } else {
            console.log(
              `🟢 First location capture: (${latitude.toFixed(6)}, ${longitude.toFixed(6)}), Accuracy: ±${accuracy.toFixed(0)}m`
            );
          }

          console.log('🔴 SAVING LOCATION! Significant movement detected:', {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            accuracy: accuracy.toFixed(0),
          });

          // Save location to MongoDB
          api.journey.saveLocation(latitude, longitude, accuracy)
            .then((result) => {
              console.log('✅ Location saved to MongoDB:', result);
              lastSavedLocation = {
                lat: latitude,
                lon: longitude,
                timestamp: now,
              };
            })
            .catch((err) => {
              console.error('❌ Failed to save location:', err);
            });
        } catch (err) {
          console.error('❌ Error processing location:', err);
        }
      };

      const handleLocationError = (error: GeolocationPositionError) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.warn('⚠️ Location permission denied. Enable location in browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn('⚠️ Location unavailable');
            break;
          case error.TIMEOUT:
            console.warn('⚠️ Location request timeout');
            break;
        }
      };

      // Watch position continuously (browser will call as it updates)
      const watchId = navigator.geolocation.watchPosition(
        captureLocationViaBrowser,
        handleLocationError,
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000,
        }
      );

      // Cleanup on unmount
      return () => navigator.geolocation.clearWatch(watchId);
    }

    // Auto-populate timeline with all notes, reminders, and routines on first load
    if (user) {
      const autoPopulateTimeline = async () => {
        try {
          // Check if timeline has been populated (using a flag in localStorage)
          const timelinePopulated = localStorage.getItem('memoaid_timeline_populated');
          if (timelinePopulated === 'true') return; // Already populated

          // Wait for data to load (give it a moment)
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Get current notes from state/localStorage
          const notesData = JSON.parse(localStorage.getItem('memoaid_notes') || '[]');
          for (const note of notesData) {
            try {
              await api.timeline.createEvent('note', {
                title: note.title || 'Note',
                content: note.content || '',
              }, note.timestamp || Date.now());
            } catch (err) {
              // Skip if already exists
              console.warn('Timeline event may already exist:', err);
            }
          }

          // Get current reminders
          const remindersData = JSON.parse(localStorage.getItem('memoaid_reminders') || '[]');
          for (const reminder of remindersData) {
            try {
              await api.timeline.createEvent('reminder', {
                text: reminder.text || 'Reminder',
              }, reminder.dueDate ? new Date(reminder.dueDate).getTime() : Date.now());
            } catch (err) {
              console.warn('Timeline event may already exist:', err);
            }
          }

          // Get current routines
          const routinesData = JSON.parse(localStorage.getItem('memoaid_routines') || '[]');
          for (const routine of routinesData) {
            try {
              await api.timeline.createEvent('routine', {
                title: routine.title || 'Routine',
              }, routine.time || Date.now());
            } catch (err) {
              console.warn('Timeline event may already exist:', err);
            }
          }

          // Mark as populated
          localStorage.setItem('memoaid_timeline_populated', 'true');
          console.log('✅ Timeline auto-populated with existing data');
        } catch (err) {
          console.warn('Failed to auto-populate timeline:', err);
        }
      };

      autoPopulateTimeline();
    }

    return () => {
      // Cleanup on unmount
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem('memoaid_notes', JSON.stringify(notes));
    // Remove the problematic sync logic that was causing notes to disappear
    // Notes are now synced only when added/updated/deleted individually
  }, [notes]);

  useEffect(() => {
    try {
      // Sanitize people data before saving to localStorage
      // Remove large data URLs to prevent quota errors
      const sanitizedPeople = people.map(person => {
        // If avatarUrl is a data URL (base64), don't store it in localStorage
        if (person.avatarUrl && person.avatarUrl.startsWith('data:')) {
          return { ...person, avatarUrl: undefined };
        }
        return person;
      });

      localStorage.setItem('memoaid_people', JSON.stringify(sanitizedPeople));
    } catch (error) {
      console.error('Failed to save people to localStorage:', error);
      // If quota exceeded, try to save without any avatars
      try {
        const minimalPeople = people.map(({ id, name, relation, avatarType, phone }) => ({
          id,
          name,
          relation,
          avatarType,
          phone,
        }));
        localStorage.setItem('memoaid_people', JSON.stringify(minimalPeople));
      } catch (fallbackError) {
        console.error('Failed to save even minimal people data:', fallbackError);
      }
    }
  }, [people]);

  useEffect(() => {
    localStorage.setItem('memoaid_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('memoaid_routines', JSON.stringify(routines));
  }, [routines]);

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

  // Routine scheduler: check every 30s, trigger alarm popup instead of auto-playing
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      routines.forEach((rt) => {
        // Only trigger if enabled, time reached, not already dismissed, and not already triggered in this session
        if (
          rt.enabled &&
          rt.time <= now &&
          !dismissedRoutinesThisRun.has(rt.id) &&
          !triggeredRoutinesRef.current.has(rt.id)
        ) {
          // Mark as triggered to prevent duplicate alarms
          triggeredRoutinesRef.current.add(rt.id);

          // Show alarm popup
          setActiveAlarm({ routineId: rt.id, taskName: rt.title });

          // Play alarm sound using Gemini TTS for multi-language support
          playGeminiTTS(rt.title);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [routines, dismissedRoutinesThisRun]);

  const dismissAlarm = (routineId: string) => {
    setActiveAlarm(null);
    stopVoice();
    // Mark as dismissed for this run
    setDismissedRoutinesThisRun((prev) => new Set(prev).add(routineId));
    // Clear triggered flag so it can be triggered again if rescheduled
    triggeredRoutinesRef.current.delete(routineId);
    // Update routine time to tomorrow to prevent re-triggering today
    const routine = routines.find(r => r.id === routineId);
    if (routine && routine.repeat === 'daily') {
      updateRoutine(routineId, { time: Date.now() + 24 * 60 * 60 * 1000 });
    } else if (routine) {
      updateRoutine(routineId, { enabled: false });
    }
  };

  // Gemini TTS for multi-language support
  const playGeminiTTS = async (text: string) => {
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || localStorage.getItem('gemini_api_key');
      if (!apiKey) {
        console.warn('Gemini API key not found, using browser TTS');
        playTTS(text);
        return;
      }

      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'en-US', name: 'en-US-Neural2-A' },
            audioConfig: { audioEncoding: 'MP3', pitch: 1.0, speakingRate: 1.0 },
          }),
        }
      );

      const data = await response.json();
      if (data.error) {
        console.warn('Gemini TTS error:', data.error.message, 'falling back to browser TTS');
        playTTS(text);
        return;
      }

      if (data.audioContent) {
        // Convert base64 to binary data
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Stop any existing alarm audio
        if (alarmAudioRef.current) {
          try { alarmAudioRef.current.pause(); } catch { }
        }

        const audio = new Audio(audioUrl);
        // REMOVED: audio.loop = true; - This was causing the alarm to loop forever
        audio.play().catch(() => {
          console.warn('Failed to play Gemini TTS, falling back to browser TTS');
          playTTS(text);
        });
        alarmAudioRef.current = audio;
      } else {
        console.warn('No audio content in response, using browser TTS');
        playTTS(text);
      }
    } catch (e) {
      console.warn('Gemini TTS error:', e, 'falling back to browser TTS');
      playTTS(text);
    }
  };

  const addNote = async (note: Omit<Note, 'id' | 'timestamp'>) => {
    // Sanitize mediaData - only save if it's a valid data URL
    const sanitizedNote = {
      ...note,
      mediaData: (note as any).mediaData && (note as any).mediaData.startsWith('data:') ? (note as any).mediaData : undefined,
    };

    const newNote = { ...sanitizedNote, id: Date.now().toString(), timestamp: Date.now() };
    setNotes((prev) => [newNote, ...prev]);
    if (user) {
      try {
        const response = await api.notes.create(sanitizedNote);
        // Transform MongoDB response
        const savedNote = {
          ...response,
          id: response._id || response.id,
          timestamp: new Date(response.createdAt).getTime(),
        };
        // Update with the real MongoDB data
        setNotes((prev) => [savedNote, ...prev.filter((n) => n.id !== newNote.id)]);

        // Also create a timeline event for this note
        try {
          await api.timeline.createEvent('note', {
            title: sanitizedNote.title || 'Note',
            content: sanitizedNote.content || '',
            mediaData: sanitizedNote.mediaData ? 'has-attachment' : 'no-attachment',
          }, newNote.timestamp);
        } catch (timelineErr) {
          console.warn('Failed to create timeline event for note:', timelineErr);
        }
      } catch (e) {
        console.error('API add note error:', e);
      }
    }
  };

  const addPerson = async (p: { name: string; relation?: string; avatarUrl?: string; avatarType?: 'image' | 'video' | 'audio' | 'unknown'; phone?: string }) => {
    const newPerson = { ...p, id: Date.now().toString() };

    // If avatarUrl is a data URL, save it to IndexedDB and remove from state
    if (p.avatarUrl && p.avatarUrl.startsWith('data:')) {
      try {
        await saveMediaToIndexedDB(newPerson.id, p.avatarUrl);
        // Keep the avatarUrl in state for immediate display, but it won't be saved to localStorage
      } catch (error) {
        console.error('Failed to save avatar to IndexedDB:', error);
      }
    }

    setPeople((prev) => [newPerson, ...prev]);
    if (user) {
      try {
        // Send all fields including avatar to MongoDB
        const personData = {
          name: p.name,
          relationship: p.relation || '',
          email: '', // Frontend doesn't have email yet
          phone: p.phone || '',
          notes: p.relation ? `Relation: ${p.relation}` : '', // Store relation info in notes field
          avatarUrl: p.avatarUrl || '',
          avatarType: p.avatarType || 'image',
        };
        const response = await api.people.create(personData);
        // Update with the real MongoDB _id
        const mongoId = response._id || response.id;

        // If we saved to IndexedDB with temp ID, migrate to MongoDB ID
        if (p.avatarUrl && p.avatarUrl.startsWith('data:')) {
          try {
            const tempAvatar = await getMediaFromIndexedDB(newPerson.id);
            if (tempAvatar) {
              await saveMediaToIndexedDB(mongoId, tempAvatar);
              await deleteMediaFromIndexedDB(newPerson.id);
            }
          } catch (error) {
            console.error('Failed to migrate avatar to MongoDB ID:', error);
          }
        }

        setPeople((prev) =>
          prev.map((pp) =>
            pp.id === newPerson.id
              ? { ...pp, id: mongoId }
              : pp
          )
        );
      } catch (e) {
        console.error('API add person error:', e);
        // Keep the person in local state even if API fails
      }
    }
  };

  const updatePerson = async (id: string, updates: Partial<{ name: string; relation?: string; avatarUrl?: string; avatarType?: 'image' | 'video' | 'audio' | 'unknown'; phone?: string }>) => {
    // If updating avatarUrl with a data URL, save to IndexedDB
    if (updates.avatarUrl && updates.avatarUrl.startsWith('data:')) {
      try {
        await saveMediaToIndexedDB(id, updates.avatarUrl);
      } catch (error) {
        console.error('Failed to save updated avatar to IndexedDB:', error);
      }
    }

    setPeople((prev) => prev.map((pp) => (pp.id === id ? { ...pp, ...updates } : pp)));
    if (user) {
      try {
        // Send all fields including avatar to MongoDB
        const updateData: any = {};
        if (updates.name) updateData.name = updates.name;
        if (updates.relation) updateData.relationship = updates.relation;
        if (updates.phone) updateData.phone = updates.phone;
        if (updates.avatarUrl !== undefined) updateData.avatarUrl = updates.avatarUrl;
        if (updates.avatarType !== undefined) updateData.avatarType = updates.avatarType;

        await api.people.update(id, updateData);
      } catch (e) {
        console.error('API update person error:', e);
      }
    }
  };

  const deletePerson = async (id: string) => {
    setPeople((prev) => prev.filter((p) => p.id !== id));

    // Delete avatar from IndexedDB
    try {
      await deleteMediaFromIndexedDB(id);
    } catch (error) {
      console.error('Failed to delete avatar from IndexedDB:', error);
    }

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
        const response = await api.routines.create(newR);
        // Update with the real MongoDB _id
        setRoutines((prev) =>
          prev.map((rt) =>
            rt.id === newR.id
              ? { ...rt, id: response._id || response.id }
              : rt
          )
        );

        // Also create a timeline event for this routine
        try {
          await api.timeline.createEvent('routine', {
            title: newR.title || 'Routine',
            time: newR.time || new Date().toISOString(),
          }, newR.time || Date.now());
        } catch (timelineErr) {
          console.warn('Failed to create timeline event for routine:', timelineErr);
        }
      } catch (e) {
        console.error('API add routine error:', e);
      }
    }
  };

  const updateRoutine = async (id: string, updates: Partial<Routine>) => {
    setRoutines((prev) => prev.map((rt) => (rt.id === id ? { ...rt, ...updates } : rt)));
    if (user && id) {
      try {
        // Only try to update on backend if ID looks like a MongoDB ObjectId (24 hex chars)
        if (id.match(/^[0-9a-f]{24}$/i)) {
          await api.routines.update(id, updates);
        }
      } catch (e) {
        console.error('API update routine error:', e);
      }
    }
  };

  const deleteRoutine = async (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
    if (user && id) {
      try {
        // Only try to delete on backend if ID looks like a MongoDB ObjectId (24 hex chars)
        if (id.match(/^[0-9a-f]{24}$/i)) {
          await api.routines.delete(id);
        }
      } catch (e) {
        console.error('API delete routine error:', e);
      }
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    // Sanitize mediaData - only save if it's a valid data URL
    const sanitizedUpdates = {
      ...updates,
      mediaData: updates.mediaData && updates.mediaData.startsWith('data:') ? updates.mediaData : undefined,
    };

    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, ...sanitizedUpdates } : note))
    );
    if (user) {
      try {
        await api.notes.update(id, sanitizedUpdates);
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

        // Also create a timeline event for this reminder
        try {
          await api.timeline.createEvent('reminder', {
            text: newReminder.text || 'Reminder',
            dueDate: newReminder.dueDate || new Date().toISOString(),
          }, newReminder.dueDate ? new Date(newReminder.dueDate).getTime() : Date.now());
        } catch (timelineErr) {
          console.warn('Failed to create timeline event for reminder:', timelineErr);
        }
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
        activeAlarm,
        dismissAlarm,
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
