import { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ActivitySummarizer } from './ActivitySummarizer';

export const CalendarModal = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const { notes, reminders } = useData() as any;

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthDays = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array(firstDay).fill(null).concat(Array.from({ length: monthDays }, (_, i) => i + 1));

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getActivitiesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayNotes = notes?.filter((n: any) => n.createdAt?.split('T')[0] === dateStr) || [];
    const dayReminders = reminders?.filter((r: any) => r.dueDate?.split('T')[0] === dateStr) || [];
    return [...dayNotes, ...dayReminders];
  };

  const activitiesForSelectedDate = getActivitiesForDate(selectedDate);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number | null) => {
    if (!day) return false;
    return day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calendar View
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Calendar */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-lg transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-lg transition">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => {
                if (day) setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
              }}
              disabled={!day}
              className={`aspect-square rounded-lg font-semibold transition text-sm ${
                !day
                  ? 'text-transparent'
                  : isSelected(day)
                    ? 'bg-blue-500 text-white shadow-md'
                    : isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                      ? 'bg-white text-blue-500 border-2 border-blue-300'
                      : getActivitiesForDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)).length > 0
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-white hover:bg-gray-100 text-gray-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg">
          <p className="text-sm text-gray-600">Selected: <span className="font-semibold text-gray-800">{selectedDate.toDateString()}</span></p>
        </div>
      </div>

      {/* Activities */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 overflow-y-auto max-h-[500px]">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Activities</h3>
        
        {/* AI Summary */}
        <div className="mb-4">
          <ActivitySummarizer selectedDate={selectedDate} />
        </div>

        {activitiesForSelectedDate.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No activities for this date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activitiesForSelectedDate.map((activity: any, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedActivity(activity)}
                className="w-full text-left p-4 bg-white rounded-lg hover:shadow-md transition hover:bg-orange-50 border-l-4 border-orange-400"
              >
                <p className="font-semibold text-gray-800 text-sm truncate">{activity.title || activity.name}</p>
                <p className="text-xs text-gray-600 mt-1">{activity.description?.substring(0, 50)}...</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(activity.createdAt || activity.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {activity.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">{selectedActivity.title || selectedActivity.name}</h2>
              <button
                onClick={() => setSelectedActivity(null)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-light"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {selectedActivity.description && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Details</h3>
                  <p className="text-gray-600">{selectedActivity.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 py-4 border-y">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Created</p>
                  <p className="font-semibold text-gray-800">{new Date(selectedActivity.createdAt || selectedActivity.dueDate).toLocaleString()}</p>
                </div>
                {selectedActivity.location && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Location</p>
                    <p className="font-semibold text-gray-800">{selectedActivity.location}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
