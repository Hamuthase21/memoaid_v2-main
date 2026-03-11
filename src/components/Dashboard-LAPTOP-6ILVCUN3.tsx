import { useState } from 'react';
import { Header } from './Layout/Header';
import { Navigation } from './Layout/Navigation';
import { NotesList } from './Notes/NotesList';
import { AIRecall } from './AIRecall/AIRecall';
import { RemindersList } from './Reminders/RemindersList';
import { HealingPath } from './HealingPath/HealingPath';
import GeminiChat from './GeminiChat';
import PeoplePanel from './PeoplePanel';
import { useData } from '../contexts/DataContext';
import RoutinePanel from './RoutinePanel';
import MemoBotModal from './MemoBotModal';
import RoutinePopup from './RoutinePopup';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'ai' | 'reminders' | 'healing' | 'gemini'>('notes');
  const [showMemoBot, setShowMemoBot] = useState(false);
  const [memoAction, setMemoAction] = useState<string | undefined>(undefined);
  const [showRoutinePopup, setShowRoutinePopup] = useState(false);
  const { people } = useData() as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="container mx-auto px-6 py-8">
        {activeTab === 'notes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: people / shortcuts */}
            <aside className="bg-white rounded-2xl p-6 shadow-sm">
              <PeoplePanel />
            </aside>

            {/* Center: notes list (real component) */}
            <section className="lg:col-span-1 col-span-1 bg-white rounded-2xl p-6 shadow-sm">
              <NotesList />
            </section>

            {/* Right: daily routines */}
            <aside className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Daily Routine</h3>
              <RoutinePanel />
              <div className="mt-6 bg-amber-50 rounded-lg p-4">
                <div className="font-semibold mb-2">MemoBot</div>
                <p className="text-sm text-gray-700 mb-3">Need help remembering something?</p>
                <div className="space-y-2">
                  <button onClick={() => { setMemoAction('call-son'); setShowMemoBot(true); }} className="w-full text-left px-3 py-2 bg-white rounded shadow">Call my son</button>
                  <button onClick={() => { setMemoAction('show-routine'); setShowMemoBot(true); }} className="w-full text-left px-3 py-2 bg-white rounded shadow">Show my morning routine</button>
                  <button onClick={() => { setMemoAction('remind-family'); setShowMemoBot(true); }} className="w-full text-left px-3 py-2 bg-white rounded shadow">Remind my family</button>
                </div>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'ai' && <AIRecall />}
        {activeTab === 'reminders' && <RemindersList />}
        {activeTab === 'healing' && <HealingPath />}
        {activeTab === 'gemini' && <GeminiChat />}
        {showMemoBot && (
          <MemoBotModal onClose={() => setShowMemoBot(false)} action={memoAction} openFamily={memoAction === 'remind-family' || people.length === 0 && (memoAction === 'call-son' || memoAction === 'remind-family')} showRoutine={memoAction === 'show-routine'} onShowRoutine={() => { setShowRoutinePopup(true); setShowMemoBot(false); }} />
        )}
        {showRoutinePopup && (
          <RoutinePopup onClose={() => setShowRoutinePopup(false)} />
        )}
      </main>

      <footer className="bg-white border-t-2 border-gray-100 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p className="text-base">MemoAid - Your trusted companion for memory support and care</p>
        </div>
      </footer>
    </div>
  );
};
