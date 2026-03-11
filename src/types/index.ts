export interface Note {
  id: string;
  title: string;
  content?: string;
  type: 'text' | 'audio' | 'image' | 'video';
  tags: string[];
  mediaUrl?: string;
  mediaData?: string;
  timestamp: number;
}

export interface Reminder {
  id: string;
  noteId: string;
  reminderTime: number;
  status: 'pending' | 'sent' | 'dismissed';
  repeat?: 'none' | 'daily';
  voice?: boolean;
  voiceName?: string; // speechSynthesis voice name
  voicePersonId?: string; // play a person's recorded video/audio instead
}

export interface Routine {
  id: string;
  title: string;
  time: number; // timestamp for next occurrence
  enabled: boolean;
  repeat?: 'none' | 'daily';
  personId?: string; // optional link to a person
  voiceMode?: 'speech' | 'person' | 'custom';
  voiceName?: string;
  voicePersonId?: string;
  voiceUrl?: string;
}

export interface HealingContent {
  id: string;
  category: 'tip' | 'exercise' | 'game' | 'meditation';
  title: string;
  content: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface User {
  id: string;
  fullName: string;
  email: string;
}
