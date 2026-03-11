import { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

interface ReminderModalProps {
  noteId: string;
  onClose: () => void;
  existing?: { id: string; reminderTime: number; repeat?: 'none' | 'daily' };
}

export const ReminderModal = ({ noteId, onClose, existing }: ReminderModalProps) => {
  const { addReminder, updateReminder } = useData();
  const [reminderTime, setReminderTime] = useState('');
  const [repeat, setRepeat] = useState<'none' | 'daily'>('none');
  const [voice, setVoice] = useState(false);
  const [voicePersonId, setVoicePersonId] = useState<string>('');
  const { people } = useData() as any;

  // populate existing
  useEffect(() => {
    if (existing) {
      const dt = new Date(existing.reminderTime);
      setReminderTime(dt.toISOString().slice(0, 16));
      setRepeat(existing.repeat || 'none');
    }
  }, [existing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTime) return;

    const timestamp = new Date(reminderTime).getTime();
    if (existing) {
      updateReminder(existing.id, { reminderTime: timestamp, status: 'pending', ...(repeat !== 'none' ? { repeat } : {}) } as any);
    } else {
      addReminder({
        noteId,
        reminderTime: timestamp,
        status: 'pending',
        repeat,
        voice,
        voicePersonId: voicePersonId || undefined,
      });
    }

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    onClose();
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl">
        <div className="border-b-2 border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Bell className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Set Reminder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              When would you like to be reminded?
            </label>
            <input
              type="datetime-local"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              min={getMinDateTime()}
              className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
              required
            />
            <div className="mt-3">
              <label className="block text-gray-700 text-lg font-semibold mb-2">Repeat</label>
              <select value={repeat} onChange={(e) => setRepeat(e.target.value as any)} className="w-full px-3 py-2 border rounded">
                <option value="none">Does not repeat</option>
                <option value="daily">Daily</option>
              </select>
            </div>

            <div className="mt-3">
              <label className="block text-gray-700 text-lg font-semibold mb-2">Voice Reminder</label>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={voice} onChange={(e) => setVoice(e.target.checked)} />
                <div className="flex-1">
                  <select value={voicePersonId} onChange={(e) => setVoicePersonId(e.target.value)} className="w-full px-3 py-2 border rounded">
                    <option value="">Select person to play their recording (optional)</option>
                    {people.map((p:any)=> <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-gray-200 text-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
