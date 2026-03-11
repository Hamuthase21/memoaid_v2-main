import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ActivityDetailsModal } from './LocationMap';

interface Activity {
  id: string;
  title: string;
  type: 'note' | 'reminder';
  time?: string;
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
  description?: string;
}

export const DayCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const { notes, reminders } = useData() as any;

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getActivitiesForDate = (date: Date): Activity[] => {
    const dateStr = date.toDateString();
    const activities: Activity[] = [];

    // Add notes for this date
    notes?.forEach((note: any) => {
      if (note.createdAt && new Date(note.createdAt).toDateString() === dateStr) {
        activities.push({
          id: note.id,
          title: note.title,
          type: 'note',
          time: new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          description: note.content,
          location: note.location ? {
            name: note.location,
            lat: 40.7128,
            lng: -74.0060,
          } : undefined,
        });
      }
    });

    // Add reminders for this date
    reminders?.forEach((reminder: any) => {
      if (reminder.dueDate && new Date(reminder.dueDate).toDateString() === dateStr) {
        activities.push({
          id: reminder.id,
          title: reminder.title,
          type: 'reminder',
          time: new Date(reminder.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    });

    return activities.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  };

  const selectedActivities = getActivitiesForDate(selectedDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (date: number) => {
    const today = new Date();
    return (
      date === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: number) => {
    return (
      date === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => {
                if (day) {
                  setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                }
              }}
              disabled={!day}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                !day
                  ? 'text-gray-300 cursor-default'
                  : isSelected(day)
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg'
                  : isToday(day)
                  ? 'bg-emerald-100 text-emerald-700 font-bold'
                  : 'text-gray-700 hover:bg-gray-100 cursor-pointer'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Activities for selected date */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Activities - {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </h3>

        {selectedActivities.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No activities for this day</p>
        ) : (
          <div className="space-y-3">
            {selectedActivities.map((activity) => (
              <button
                key={activity.id}
                onClick={() => setSelectedActivity(activity)}
                className={`w-full text-left p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-all ${
                  activity.type === 'note'
                    ? 'bg-blue-50 border-blue-400 hover:bg-blue-100'
                    : 'bg-orange-50 border-orange-400 hover:bg-orange-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm">{activity.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                        {activity.type === 'note' ? '📝 Note' : '⏰ Reminder'}
                      </span>
                      {activity.time && (
                        <span className="text-xs text-gray-600">{activity.time}</span>
                      )}
                      {activity.location && (
                        <span className="text-xs text-red-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {activity.location.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <ActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      )}
    </div>
  );
};
