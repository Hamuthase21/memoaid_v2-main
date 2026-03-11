import { useEffect, useState } from 'react';
import { Bell, Clock, Check, X } from 'lucide-react';
import { ReminderModal } from './ReminderModal';
import { useData } from '../../contexts/DataContext';

export const RemindersList = () => {
  const { reminders, notes, updateReminder, deleteReminder } = useData();
  const [editing, setEditing] = useState<{ id: string; noteId: string } | null>(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = Date.now();
      reminders.forEach((reminder) => {
        if (reminder.status === 'pending' && reminder.reminderTime <= now) {
          const note = notes.find((n) => n.id === reminder.noteId);
          if (note && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('MemoAid Reminder', {
              body: note.title,
              icon: '/favicon.ico',
            });
          }
          updateReminder(reminder.id, { status: 'sent' });
        }
      });
    };

    const interval = setInterval(checkReminders, 10000);
    checkReminders();

    return () => clearInterval(interval);
  }, [reminders, notes, updateReminder]);

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNote = (noteId: string) => {
    return notes.find((n) => n.id === noteId);
  };


  const activeReminders = reminders.filter((r) => r.status === 'pending');
  const pastReminders = reminders.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Reminders</h2>
        </div>
        <p className="text-emerald-50 text-lg">
          Stay on track with your important memories
        </p>
      </div>

      {activeReminders.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-600" />
            Upcoming Reminders
          </h3>
          <div className="space-y-4">
            {activeReminders.map((reminder) => {
              const note = getNote(reminder.noteId);
              if (!note) return null;

              return (
                <div
                  key={reminder.id}
                  className="bg-white rounded-xl shadow-lg p-5 border-2 border-emerald-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-1">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-2 text-gray-600 text-base">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(reminder.reminderTime)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditing({ id: reminder.id, noteId: reminder.noteId })}
                        className="p-2 hover:bg-emerald-50 rounded-lg transition-colors text-emerald-600"
                        title="Edit reminder"
                      >
                        <Clock className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        title="Delete reminder"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {editing && (
        <ReminderModal
          noteId={editing.noteId}
          existing={{ id: editing.id, reminderTime: reminders.find(r => r.id === editing.id)!.reminderTime, repeat: (reminders.find(r => r.id === editing.id) as any).repeat || 'none' }}
          onClose={() => setEditing(null)}
        />
      )}

      {pastReminders.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Check className="w-6 h-6 text-gray-600" />
            Past Reminders
          </h3>
          <div className="space-y-4">
            {pastReminders.map((reminder) => {
              const note = getNote(reminder.noteId);
              if (!note) return null;

              return (
                <div
                  key={reminder.id}
                  className="bg-white rounded-xl shadow-lg p-5 border-2 border-gray-200 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-800 mb-1">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-2 text-gray-600 text-base">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(reminder.reminderTime)}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {reminder.status === 'sent' ? 'Sent' : 'Dismissed'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                      title="Delete reminder"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeReminders.length === 0 && pastReminders.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No reminders yet</h3>
          <p className="text-gray-500 text-lg">
            Set reminders on your memories to stay on track
          </p>
        </div>
      )}
    </div>
  );
};
