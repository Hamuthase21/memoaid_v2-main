import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { api } from '../api';

interface TimelineEvent {
  id: string;
  time: string;
  eventType: string;
  eventData: Record<string, any>;
  startTime: number;
  endTime?: number;
  isImportant: boolean;
  tags: string[];
}

interface TimelineDay {
  date: string;
  eventCount: number;
  events: TimelineEvent[];
  summary?: string;
}

const TimelineView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeline, setTimeline] = useState<TimelineDay | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Format date as YYYY-MM-DD for API calls
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display (e.g., "January 22, 2026")
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Fetch timeline and summary for the selected date
  useEffect(() => {
    const fetchTimelineData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const dateStr = formatDateForAPI(selectedDate);

        // Fetch timeline events
        const timelineData = await api.timeline.getDay(dateStr);
        const summaryData = await api.timeline.getSummary(dateStr);

        console.log('Timeline data:', timelineData);
        console.log('Summary data:', summaryData);

        if (timelineData && summaryData) {
          setTimeline(timelineData);
          setSummary(summaryData.summary);
        } else {
          setError('Failed to load timeline data');
        }
      } catch (err) {
        console.error('Error fetching timeline:', err);
        setError(`Error loading timeline: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedDate) {
      fetchTimelineData();
    }
  }, [selectedDate]);

  // Navigate to previous day
  const handlePreviousDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  // Navigate to next day
  const handleNextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  // Navigate to today
  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Get icon for event type
  const getEventIcon = (eventType: string): string => {
    const icons: Record<string, string> = {
      note: '📝',
      reminder: '🔔',
      routine: '⏰',
      person: '👤',
      location: '📍',
      custom: '•',
    };
    return icons[eventType] || '•';
  };

  const isToday = (): boolean => {
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  };

  const isFuture = (): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    return selected > today;
  };

  const timelineEvents = timeline?.events || [];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header: Date Navigation */}
      <div className="bg-white border-b border-slate-200 shadow-sm p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePreviousDay}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Previous day"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>

            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-slate-900">
                {formatDateForDisplay(selectedDate)}
              </h1>
              <p className="text-sm text-slate-500">
                {isToday() ? 'Today' : isFuture() ? 'Future' : formatDateForAPI(selectedDate)}
              </p>
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              title="Next day"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleToday}
              className={`px-4 py-2 rounded-lg transition ${
                isToday()
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Daily Summary */}
          {!isLoading && timeline && (
            <div className="m-4 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-slate-900 text-lg">Day Summary</h2>
                  <p className="text-slate-600 mt-2">{summary}</p>
                  {timeline.eventCount > 0 && (
                    <p className="text-sm text-slate-500 mt-2">
                      {timeline.eventCount} event{timeline.eventCount !== 1 ? 's' : ''} recorded
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Events */}
          {isLoading && (
            <div className="m-4 p-8 bg-white rounded-lg border border-slate-200 text-center">
              <p className="text-slate-500">Loading timeline...</p>
            </div>
          )}

          {error && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!isLoading && timelineEvents.length === 0 && !error && (
            <div className="m-4 p-8 bg-white rounded-lg border border-slate-200 text-center">
              <p className="text-slate-500">No events recorded for this day</p>
            </div>
          )}

          {!isLoading && timelineEvents.length > 0 && (
            <div className="m-4 space-y-4">
              {/* Vertical Timeline */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {timelineEvents.map((event, idx) => (
                    <div key={event.id || idx} className="flex gap-4 p-4 hover:bg-slate-50 transition">
                      {/* Time marker on the left */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className="w-3 h-3 bg-blue-500 rounded-full border-4 border-white shadow-sm" />
                        <div className="text-xs font-mono text-slate-500 whitespace-nowrap">
                          {event.time}
                        </div>
                      </div>

                      {/* Event content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getEventIcon(event.eventType)}</span>
                          <span className="text-xs font-semibold uppercase text-slate-500">
                            {event.eventType}
                          </span>
                          {event.isImportant && (
                            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">
                              Important
                            </span>
                          )}
                        </div>

                        {/* Event details based on type */}
                        <div className="mt-2">
                          {event.eventType === 'note' && (
                            <p className="text-slate-700 font-medium">
                              {event.eventData.title || event.eventData.content || 'Note'}
                            </p>
                          )}
                          {event.eventType === 'reminder' && (
                            <p className="text-slate-700 font-medium">
                              {event.eventData.text || event.eventData.title || 'Reminder'}
                            </p>
                          )}
                          {event.eventType === 'routine' && (
                            <p className="text-slate-700 font-medium">
                              {event.eventData.title || event.eventData.task || 'Routine'}
                            </p>
                          )}
                          {event.eventType === 'person' && (
                            <p className="text-slate-700 font-medium">
                              {event.eventData.name || 'Person'}
                            </p>
                          )}
                          {event.eventType === 'location' && (
                            <p className="text-slate-700 font-medium">
                              {event.eventData.address || event.eventData.name || 'Location'}
                            </p>
                          )}

                          {/* Tags */}
                          {event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {event.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Duration */}
                          {event.endTime && (
                            <p className="text-xs text-slate-500 mt-1">
                              Duration:{' '}
                              {Math.round((event.endTime - event.startTime) / 60000)}{' '}
                              minute{Math.round((event.endTime - event.startTime) / 60000) !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineView;
