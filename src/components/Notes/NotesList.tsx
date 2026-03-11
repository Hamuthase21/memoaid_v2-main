import { useState } from 'react';
import { Search, Plus, Filter, X, Calendar } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { NoteCard } from './NoteCard';
import { AddNoteModal } from './AddNoteModal';

export const NotesList = () => {
  const { notes, searchNotes } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'audio' | 'image'>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  const getDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  let filteredNotes = searchQuery
    ? searchNotes(searchQuery)
    : filterType === 'all'
    ? notes
    : notes.filter((note) => note.type === filterType);

  if (selectedDate) {
    filteredNotes = filteredNotes.filter((note) => {
      const noteDate = getDateString(new Date(note.timestamp));
      return noteDate === selectedDate;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-base font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Memory
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <label className="text-sm font-semibold text-blue-800">Filter by Date</label>
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 px-4 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors font-medium"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm flex items-center gap-1"
              title="Clear date filter"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
        {selectedDate && (
          <p className="text-xs text-blue-700 mt-2">
            Showing notes from {new Date(selectedDate).toDateString()}
          </p>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all ${
            filterType === 'all'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-5 h-5 inline mr-2" />
          All
        </button>
        <button
          onClick={() => setFilterType('text')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all ${
            filterType === 'text'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Text Notes
        </button>
        <button
          onClick={() => setFilterType('audio')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all ${
            filterType === 'audio'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Audio
        </button>
        <button
          onClick={() => setFilterType('image')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all ${
            filterType === 'image'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Images
        </button>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No memories found</h3>
          <p className="text-gray-500 text-lg mb-6">
            {searchQuery
              ? 'Try a different search term'
              : 'Start adding memories to build your personal vault'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Plus className="w-6 h-6" />
              Add Your First Memory
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {showAddModal && <AddNoteModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};
