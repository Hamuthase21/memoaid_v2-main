import { useState, useEffect } from 'react';
import { Sparkles, Loader, Calendar } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface ActivitySummary {
  date: string;
  summary: string;
  activityCount: number;
  locations: string[];
  isLoading: boolean;
}

export const ActivitySummarizer = ({ selectedDate }: { selectedDate: Date }) => {
  const { notes, reminders } = useData() as any;
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper function to format date as YYYY-MM-DD without timezone issues
  const getDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if selectedDate is today
  const isToday = (): boolean => {
    const today = new Date();
    return getDateString(selectedDate) === getDateString(today);
  };

  useEffect(() => {
    const generateSummary = async () => {
      // Format dates properly
      const selectedDateStr = getDateString(selectedDate);
      const todayStr = getDateString(new Date());

      // Get activities for the selected date
      let dayNotes: any[] = [];
      let dayReminders: any[] = [];

      // Filter activities by date - always use the selected date
      dayNotes = notes?.filter((n: any) => {
        const noteDate = getDateString(new Date(n.createdAt));
        return noteDate === selectedDateStr;
      }) || [];

      dayReminders = reminders?.filter((r: any) => {
        const reminderDate = getDateString(new Date(r.dueDate));
        return reminderDate === selectedDateStr;
      }) || [];

      const activities = [...dayNotes, ...dayReminders];

      if (activities.length === 0) {
        setSummary({
          date: selectedDate.toDateString(),
          summary: `No activities recorded for ${selectedDate.toDateString()}.`,
          activityCount: 0,
          locations: [],
          isLoading: false,
        });
        return;
      }

      setIsGenerating(true);

      try {
        // Extract locations
        const locations = activities
          .filter((a: any) => a.location)
          .map((a: any) => a.location)
          .slice(0, 3);

        // Prepare activity text for Gemini with actual content
        const activitiesText = activities
          .map((a: any) => {
            // Check if it's a note or reminder
            const isNote = a.content !== undefined && a.title !== undefined;
            const type = isNote ? 'Note' : 'Reminder';

            // Get content from various possible fields
            const content = a.content || a.description || a.title || 'No details';
            const location = a.location ? ` at ${a.location}` : '';

            // Try to get time from either createdAt or dueDate
            let time = '';
            if (a.createdAt) {
              time = new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (a.dueDate) {
              time = new Date(a.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            return `${type}${time ? ` (${time})` : ''}: ${content}${location}`;
          })
          .join('\n- ');

        console.log('Calling API with activities:', activitiesText);

        const response = await fetch('http://192.168.1.4:5000/api/gemini-summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
          },
          body: JSON.stringify({
            activities: activitiesText,
            date: isToday() ? 'Today' : selectedDate.toDateString(),
          }),
        });

        console.log('API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('API response data:', data);
          setSummary({
            date: isToday() ? `Today (${selectedDate.toDateString()})` : selectedDate.toDateString(),
            summary: data.summary,
            activityCount: activities.length,
            locations,
            isLoading: false,
          });
        } else {
          console.log('API returned error, using fallback');
          // Fallback if API not available
          generateFallbackSummary(activities, selectedDateStr);
        }
      } catch (error) {
        console.error('Error generating summary:', error);
        generateFallbackSummary(activities, selectedDateStr);
      } finally {
        setIsGenerating(false);
      }
    };

    if (selectedDate) {
      generateSummary();
    }
  }, [selectedDate, notes, reminders]);

  const generateFallbackSummary = (activities: any[], dateStr: string) => {
    // Notes have 'content' field, reminders don't
    const notesCount = activities.filter((a: any) => a.content !== undefined).length;
    const remindersCount = activities.filter((a: any) => a.content === undefined).length;

    // Build conversational narrative summary
    const dateDisplay = isToday() ? `today` : `on ${selectedDate.toDateString()}`;
    const notes = activities.filter((a: any) => a.content);
    const reminders = activities.filter((a: any) => !a.content);

    // Start with opening sentence
    let narrativeSummary = '';

    if (activities.length === 0) {
      narrativeSummary = `You didn't record any activities ${dateDisplay}.`;
    } else if (activities.length === 1) {
      narrativeSummary = `You had one activity ${dateDisplay}. `;
    } else {
      narrativeSummary = `You had ${activities.length} activities ${dateDisplay}. `;
    }

    // Add notes narrative
    if (notesCount > 0) {
      if (notesCount === 1) {
        const note = notes[0];
        narrativeSummary += `You saved a note about "${note.title || 'your memory'}". `;
      } else if (notesCount === 2) {
        narrativeSummary += `You saved notes about "${notes[0].title || 'your memory'}" and "${notes[1].title || 'another memory'}". `;
      } else {
        const firstTwo = notes.slice(0, 2).map((n: any) => `"${n.title || 'your memory'}"`).join(' and ');
        narrativeSummary += `You saved ${notesCount} notes including ${firstTwo}, and ${notesCount - 2} more. `;
      }
    }

    // Add reminders narrative
    if (remindersCount > 0) {
      if (remindersCount === 1) {
        const reminder = reminders[0];
        narrativeSummary += `You also set a reminder for "${reminder.title || 'a task'}". `;
      } else if (remindersCount === 2) {
        narrativeSummary += `You also set reminders for "${reminders[0].title || 'a task'}" and "${reminders[1].title || 'another task'}". `;
      } else {
        const firstTwo = reminders.slice(0, 2).map((r: any) => `"${r.title || 'a task'}"`).join(' and ');
        narrativeSummary += `You also set ${remindersCount} reminders including ${firstTwo}, and ${remindersCount - 2} more. `;
      }
    }

    // Add closing sentence
    if (activities.length > 0) {
      if (isToday()) {
        narrativeSummary += `Keep up the great work tracking your memories!`;
      } else {
        narrativeSummary += `These memories help you remember what you did that day.`;
      }
    }

    setSummary({
      date: isToday() ? `Today (${selectedDate.toDateString()})` : selectedDate.toDateString(),
      summary: narrativeSummary,
      activityCount: activities.length,
      locations: [],
      isLoading: false,
    });
  };

  if (isGenerating) {
    return (
      <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-500">
        <div className="flex items-center gap-3">
          <Loader className="w-5 h-5 text-purple-500 animate-spin" />
          <p className="text-sm text-gray-700">Generating AI summary...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  // Extract notes and reminders for display
  const selectedDateStr = getDateString(selectedDate);
  const dayNotes = notes?.filter((n: any) => {
    const noteDate = getDateString(new Date(n.createdAt));
    return noteDate === selectedDateStr;
  }) || [];
  const dayReminders = reminders?.filter((r: any) => {
    const reminderDate = getDateString(new Date(r.dueDate));
    return reminderDate === selectedDateStr;
  }) || [];

  return (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-l-4 border-purple-500 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-800">Daily Summary</h3>
      </div>

      {/* Render the formatted summary from Gemini */}
      <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
        {summary.summary.split('\n').map((line: string, idx: number) => {
          // Handle headers
          if (line.startsWith('#')) {
            const headerLevel = line.match(/^#+/)?.[0].length || 1;
            const headerText = line.replace(/^#+\s*/, '');
            const isH1 = headerLevel === 1;
            const isH2 = headerLevel === 2;

            if (isH1) {
              return null; // Skip the title since we already have it
            }
            if (isH2) {
              return (
                <h4 key={idx} className="font-semibold text-gray-800 mt-4 mb-2 text-sm">
                  {headerText}
                </h4>
              );
            }
          }
          // Handle bullet points
          else if (line.trim().startsWith('-')) {
            const bulletText = line.replace(/^\s*-\s*/, '');
            return (
              <div key={idx} className="flex gap-2 mb-1">
                <span className="text-purple-500 flex-shrink-0">•</span>
                <span className="text-gray-700">{bulletText}</span>
              </div>
            );
          }
          // Handle empty lines
          else if (line.trim() === '') {
            return null;
          }
          // Handle regular text
          else {
            return (
              <p key={idx} className="text-gray-700 mb-2">
                {line}
              </p>
            );
          }
        })}
      </div>
    </div>
  );
};
