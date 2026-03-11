import { useState } from 'react';
import { MessageCircle, Search, Calendar, AlertCircle } from 'lucide-react';
import { Header } from './Layout/Header';
import { Navigation } from './Layout/Navigation';
import { NotesList } from './Notes/NotesList';
import { HealingPath } from './HealingPath/HealingPath';
import LocationTimeline from './LocationTimeline';
import GeminiChat from './GeminiChat';
import PeoplePanel from './PeoplePanel';
import { CalendarModal } from './CalendarModal';
import { useData } from '../contexts/DataContext';
import RoutinePanel from './RoutinePanel';
import AlarmModal from './AlarmModal';
import EmergencyModal from './EmergencyModal';
import MedicationPanel from './MedicationPanel';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'locations' | 'healing' | 'medications'>('notes');
  const [showGeminiChat, setShowGeminiChat] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(true);
  const { people, activeAlarm, dismissAlarm, stopVoice, playVoice } = useData() as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-6 py-8">
        {activeTab === 'notes' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: people / shortcuts */}
              <aside className="bg-white rounded-2xl p-6 shadow-sm">
                <PeoplePanel />
              </aside>

              {/* Center: notes list (real component) */}
              <section className="lg:col-span-1 col-span-1 bg-white rounded-2xl p-6 shadow-sm">
                <NotesList />
              </section>

              {/* Right: daily routines only */}
              <aside className="bg-white rounded-2xl p-6 shadow-sm overflow-y-auto max-h-[calc(100vh-200px)]">
                <h3 className="text-lg font-semibold mb-4">Daily Routine</h3>
                <RoutinePanel />
              </aside>
            </div>

            {/* Action Buttons - Bottom Left */}
            <div className="fixed bottom-8 left-8 flex gap-4">
              <button
                onClick={() => setShowEmergency(true)}
                className="w-16 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-white z-50"
                title="Emergency Contacts"
              >
                <AlertCircle className="w-8 h-8" />
              </button>
            </div>

            {/* Search and Chat Icons - Far Right End */}
            <div className="fixed bottom-8 right-8 flex gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-white z-50"
                title="Search notes"
              >
                <Search className="w-8 h-8" />
              </button>
              <button
                onClick={() => setShowCalendar(true)}
                className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-white z-50"
                title="View calendar"
              >
                <Calendar className="w-8 h-8" />
              </button>
              <button
                onClick={() => setShowGeminiChat(true)}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-white z-50"
                title="Chat with MemoBot"
              >
                <MessageCircle className="w-8 h-8" />
              </button>
            </div>

            {/* Search Modal */}
            {searchOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Search Notes</h2>
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      placeholder="Search your memories..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Gemini Chat Modal */}
            {showGeminiChat && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-2xl h-96 lg:h-[600px] shadow-2xl flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Chat with MemoBot</h2>
                    <button
                      onClick={() => setShowGeminiChat(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <GeminiChat />
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Modal - Side by Side */}
            {showCalendar && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Calendar & Activities</h2>
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="text-gray-500 hover:text-gray-700 text-3xl font-light"
                    >
                      ×
                    </button>
                  </div>
                  <CalendarModal />
                </div>
              </div>
            )}
          </>
        ) : activeTab === 'healing' ? (
          <HealingPath />
        ) : activeTab === 'medications' ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm max-w-4xl mx-auto">
            <MedicationPanel />
          </div>
        ) : (
          <LocationTimeline />
        )}
      </main>

      {/* Alarm Modal */}
      {activeAlarm && (
        <AlarmModal
          taskName={activeAlarm.taskName}
          onDismiss={() => {
            stopVoice();
            setIsAlarmPlaying(false);
            dismissAlarm(activeAlarm.routineId);
          }}
          isPlaying={isAlarmPlaying}
          onToggleAudio={() => {
            if (isAlarmPlaying) {
              stopVoice();
              setIsAlarmPlaying(false);
            } else {
              setIsAlarmPlaying(true);
            }
          }}
        />
      )}

      {/* Emergency Modal */}
      {showEmergency && (
        <EmergencyModal onClose={() => setShowEmergency(false)} />
      )}

      <footer className="bg-white border-t-2 border-gray-100 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p className="text-base">MemoAid - Your trusted companion for memory support and care</p>
        </div>
      </footer>
    </div>
  );
};
